import { Server, Socket } from 'socket.io';
import Duel from '../models/duel.model';
import { fetchProblemsList, fetchProblemDetails, fetchRecentSubmissions } from '../utils/leetcode.graphql';

// ─── Active polling intervals (keyed by roomId) ─────────────────
// Tracks setInterval handles so we can clear them on match end.
const activePollers = new Map<string, NodeJS.Timeout>();

// ─── Duel Socket Handler ────────────────────────────────────────
// Handles the complete 1v1 match lifecycle via WebSocket events.
// Problems are fetched LIVE from the LeetCode API.
// Winner is detected by POLLING each player's recent_submissions.

/**
 * Generates a random 6-character alphanumeric room code.
 */
const generateRoomId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Registers all duel-related event listeners on a given socket connection.
 * @param io     - The global Socket.io server instance (for broadcasting)
 * @param socket - The individual client socket connection
 */
export const duelHandler = (io: Server, socket: Socket) => {
  console.log(`⚔️  Duel handler attached for socket: ${socket.id}`);

  // ───────────────────────────────────────────────
  // EVENT: create_room
  // Flow: Player clicks "Create Room" →
  //       Server generates a roomId, creates a Duel doc,
  //       joins the socket to the room, emits room_created.
  //       Requires a verified leetcodeUsername.
  // ───────────────────────────────────────────────
  socket.on('create_room', async (payload: {
    userId: string;
    username: string;
    leetcodeUsername: string;
  }) => {
    try {
      const { userId, username, leetcodeUsername } = payload;

      if (!leetcodeUsername) {
        socket.emit('error', { message: 'You must verify your LeetCode username before competing.' });
        return;
      }

      const roomId = generateRoomId();

      const duel = await Duel.create({
        roomId,
        players: [{
          userId,
          socketId: socket.id,
          username,
          leetcodeUsername,
        }],
        status: 'waiting',
      });

      socket.join(roomId);

      socket.emit('room_created', {
        roomId: duel.roomId,
        duelId: duel._id,
        message: `Room ${roomId} created. Share this code with your opponent!`,
      });

      console.log(`🏠 Room ${roomId} created by ${username} (LC: ${leetcodeUsername})`);
    } catch (error: any) {
      console.error('❌ create_room error:', error.message);
      socket.emit('error', { message: 'Failed to create room. Please try again.' });
    }
  });

  // ───────────────────────────────────────────────
  // EVENT: join_room
  // Flow: Player enters a roomId and clicks "Join" →
  //       Server validates, adds the second player,
  //       emits match_ready to BOTH players.
  // ───────────────────────────────────────────────
  socket.on('join_room', async (payload: {
    roomId: string;
    userId: string;
    username: string;
    leetcodeUsername: string;
  }) => {
    try {
      const { roomId, userId, username, leetcodeUsername } = payload;

      if (!leetcodeUsername) {
        socket.emit('error', { message: 'You must verify your LeetCode username before competing.' });
        return;
      }

      const duel = await Duel.findOne({ roomId });

      if (!duel) {
        socket.emit('error', { message: `Room "${roomId}" does not exist.` });
        return;
      }

      if (duel.status !== 'waiting') {
        socket.emit('error', { message: 'This room is no longer accepting players.' });
        return;
      }

      if (duel.players.length >= 2) {
        socket.emit('error', { message: 'Room is already full.' });
        return;
      }

      const alreadyInRoom = duel.players.some(p => p.userId.toString() === userId);
      if (alreadyInRoom) {
        socket.emit('error', { message: 'You are already in this room.' });
        return;
      }

      // Add second player
      duel.players.push({
        userId: userId as any,
        socketId: socket.id,
        username,
        leetcodeUsername,
      });
      duel.status = 'active';
      await duel.save();

      socket.join(roomId);

      // Notify ALL players in the room
      io.to(roomId).emit('match_ready', {
        duelId: duel._id,
        roomId: duel.roomId,
        players: duel.players.map(p => ({
          userId: p.userId,
          username: p.username,
          leetcodeUsername: p.leetcodeUsername,
        })),
        message: 'Both players connected! Select a difficulty to start.',
      });

      console.log(`🤝 ${username} (LC: ${leetcodeUsername}) joined room ${roomId}`);
    } catch (error: any) {
      console.error('❌ join_room error:', error.message);
      socket.emit('error', { message: 'Failed to join room. Please try again.' });
    }
  });

  // ───────────────────────────────────────────────
  // EVENT: start_match
  // Flow: Player selects difficulty →
  //       Server fetches a random problem from LeetCode API,
  //       emits problem_assigned, then starts polling
  //       both players' recent_submissions every 5s.
  // ───────────────────────────────────────────────
  socket.on('start_match', async (payload: {
    roomId: string;
    userId: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }) => {
    try {
      const { roomId, userId, difficulty } = payload;

      const duel = await Duel.findOne({ roomId, status: 'active' });
      if (!duel) {
        socket.emit('error', { message: 'No active match found for this room.' });
        return;
      }

      if (duel.players[0].userId.toString() !== userId) {
        socket.emit('error', { message: 'Only the room creator can start the match.' });
        return;
      }

      await assignNewProblem(io, socket, duel, difficulty);

    } catch (error: any) {
      console.error('❌ start_match error:', error.message);
      socket.emit('error', { message: 'Failed to start match. Please try again.' });
    }
  });

  // ───────────────────────────────────────────────
  // EVENT: reroll_problem
  // Flow: Host clicks "Reroll", skips current problem fetching a new one
  // ───────────────────────────────────────────────
  socket.on('reroll_problem', async (payload: {
    roomId: string;
    userId: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }) => {
    try {
      const { roomId, userId, difficulty } = payload;

      const duel = await Duel.findOne({ roomId, status: 'active' });
      if (!duel) {
        socket.emit('error', { message: 'No active match found for this room.' });
        return;
      }

      if (duel.players[0].userId.toString() !== userId) {
        socket.emit('error', { message: 'Only the room creator can reroll the problem.' });
        return;
      }

      await assignNewProblem(io, socket, duel, difficulty);

    } catch (error: any) {
      console.error('❌ reroll_problem error:', error.message);
      socket.emit('error', { message: 'Failed to reroll problem. Please try again.' });
    }
  });

  // ───────────────────────────────────────────────
  // EVENT: disconnect
  // ───────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`👋 Socket disconnected: ${socket.id}`);
  });
};

// ─── Problem Assignment Helper ──────────────────────────────────
async function assignNewProblem(io: Server, socket: Socket, duel: any, difficulty: 'easy' | 'medium' | 'hard') {
  // Clear any existing polling loop before spinning up a new problem
  const existingInterval = activePollers.get(duel.roomId);
  if (existingInterval) {
    clearInterval(existingInterval);
    activePollers.delete(duel.roomId);
  }

  const difficultyMap: Record<string, 'EASY' | 'MEDIUM' | 'HARD'> = {
    easy: 'EASY',
    medium: 'MEDIUM',
    hard: 'HARD',
  };

  io.to(duel.roomId).emit('loading_problem', {
    message: 'Fetching a random problem from LeetCode...',
  });

  const problemList = await fetchProblemsList(
    difficultyMap[difficulty],
    50,
    Math.floor(Math.random() * 200) // Random offset for variety
  );

  // Filter out premium (paid) problems so users can actually see the content
  const freeProblems = problemList?.questions?.filter((q: any) => !q.isPaidOnly) || [];

  if (freeProblems.length === 0) {
    socket.emit('error', { message: `No free ${difficulty} problems found in this set.` });
    return;
  }

  // Pick a random problem from the fetched free list
  const randomIndex = Math.floor(Math.random() * freeProblems.length);
  const selectedProblem = freeProblems[randomIndex];

  // Fetch full problem details (description, code snippets, etc.)
  const fullProblem = await fetchProblemDetails(selectedProblem.titleSlug);

  // Update duel with the assigned problem
  duel.problemSlug = selectedProblem.titleSlug;
  duel.problemTitle = fullProblem.title;
  duel.difficulty = difficulty;
  duel.startTime = new Date();
  await duel.save();

  // Emit the problem to both players simultaneously
  io.to(duel.roomId).emit('problem_assigned', {
    duelId: duel._id,
    problem: {
      title: fullProblem.title,
      titleSlug: fullProblem.titleSlug,
      content: fullProblem.content,        // HTML description
      difficulty: fullProblem.difficulty,
      topicTags: fullProblem.topicTags,
      codeSnippets: fullProblem.codeSnippets,
      leetcodeUrl: `https://leetcode.com/problems/${fullProblem.titleSlug}/`,
    },
    startTime: duel.startTime,
  });

  console.log(`🎯 Problem "${fullProblem.title}" (${difficulty}) assigned in room ${duel.roomId}`);

  // ── Start submission polling ───────────────────────────
  startSubmissionPolling(io, duel.roomId, duel.players, selectedProblem.titleSlug, duel.startTime!);
}

// ─── Submission Polling Logic ───────────────────────────────────
// Polls LeetCode's recent_submissions for both players every 5s.
// First player with an "Accepted" submission for the matching
// titleSlug (after startTime) wins the duel.

function startSubmissionPolling(
  io: Server,
  roomId: string,
  players: {
    userId: any;
    socketId: string;
    username: string;
    leetcodeUsername: string;
  }[],
  problemSlug: string,
  startTime: Date
) {
  // Safety: convert startTime to unix seconds for comparison
  const startUnix = Math.floor(startTime.getTime() / 1000);
  let pollCount = 0;
  const MAX_POLLS = 360; // 5s * 360 = 30 minutes max

  console.log(`📡 Starting submission polling for room ${roomId} | Problem: ${problemSlug}`);

  const interval = setInterval(async () => {
    pollCount++;

    // Safety timeout — 30 minute max
    if (pollCount > MAX_POLLS) {
      clearInterval(interval);
      activePollers.delete(roomId);

      // Update duel as completed with no winner (draw / timeout)
      await Duel.findOneAndUpdate(
        { roomId },
        { status: 'completed', endTime: new Date() }
      );

      io.to(roomId).emit('match_over', {
        winner: null,
        durationSeconds: pollCount * 5,
        message: '⏰ Time ran out! No one solved it in time.',
      });

      console.log(`⏰ Room ${roomId} timed out after ${pollCount * 5}s`);
      return;
    }

    try {
      // Check each player's recent submissions in parallel
      for (const player of players) {
        try {
          const submissions = await fetchRecentSubmissions(player.leetcodeUsername, 1);

          // Look for an "Accepted" submission for our problem after startTime
          const accepted = submissions.find(
            (sub: any) =>
              sub.titleSlug === problemSlug &&
              sub.statusDisplay === 'Accepted' &&
              parseInt(sub.timestamp) >= startUnix
          );

          if (accepted) {
            // We have a winner!
            clearInterval(interval);
            activePollers.delete(roomId);

            const endTime = new Date();
            const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

            // Update the duel
            await Duel.findOneAndUpdate(
              { roomId },
              {
                status: 'completed',
                winnerId: player.userId,
                endTime,
              }
            );

            io.to(roomId).emit('match_over', {
              winner: {
                userId: player.userId,
                username: player.username,
                leetcodeUsername: player.leetcodeUsername,
              },
              durationSeconds,
              message: `🏆 ${player.username} wins the duel in ${durationSeconds}s!`,
            });

            console.log(`🏆 Room ${roomId} — Winner: ${player.username} (${player.leetcodeUsername}) in ${durationSeconds}s`);
            return;
          }
        } catch (playerError: any) {
          // Don't crash the entire poll loop if one player's fetch fails
          console.warn(`⚠️  Failed to poll submissions for ${player.leetcodeUsername}:`, playerError.message);
        }
      }
    } catch (error: any) {
      console.error(`❌ Polling error for room ${roomId}:`, error.message);
    }
  }, 2000); // Poll every 2 seconds

  activePollers.set(roomId, interval);
}
