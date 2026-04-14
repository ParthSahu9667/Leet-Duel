import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Player, DuelProblem, MatchPhase } from '@/types/type';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function useDuelMatch(user: any) {
  const socketRef = useRef<Socket | null>(null);

  // Match State
  const [phase, setPhase] = useState<MatchPhase>('idle');
  const [roomId, setRoomId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [problem, setProblem] = useState<DuelProblem | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [matchOverMessage, setMatchOverMessage] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Socket connection & listeners
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('room_created', (data: { roomId: string; duelId: string }) => {
      setRoomId(data.roomId);
      setPhase('waiting');
      setErrorMsg('');
    });

    socket.on('match_ready', (data: { roomId: string; players: Player[] }) => {
      setPlayers(data.players);
      setRoomId(data.roomId);
      setPhase('ready');
      setErrorMsg('');
    });

    socket.on('loading_problem', () => {
      setPhase('loading');
    });

    socket.on('problem_assigned', (data: { problem: DuelProblem; startTime: string }) => {
      setProblem(data.problem);
      setPhase('playing');
      setErrorMsg('');
      setElapsedTime(0);
    });

    socket.on('match_over', (data: {
      winner: Player | null;
      durationSeconds: number;
      message: string;
    }) => {
      setWinner(data.winner);
      setDurationSeconds(data.durationSeconds);
      setMatchOverMessage(data.message);
      setPhase('finished');
      setErrorMsg('');
    });

    socket.on('error', (data: { message: string }) => {
      setErrorMsg(data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Timer calculation
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Actions
  const handleCreateRoom = useCallback(() => {
    if (!socketRef.current || !user || !user.leetcodeUsername) return;
    setErrorMsg('');
    socketRef.current.emit('create_room', {
      userId: user.id,
      username: user.name,
      leetcodeUsername: user.leetcodeUsername,
    });
  }, [user]);

  const handleJoinRoom = useCallback(() => {
    if (!socketRef.current || !user || !user.leetcodeUsername || !joinCode.trim()) return;
    setErrorMsg('');
    socketRef.current.emit('join_room', {
      roomId: joinCode.trim().toUpperCase(),
      userId: user.id,
      username: user.name,
      leetcodeUsername: user.leetcodeUsername,
    });
  }, [user, joinCode]);

  const handleStartMatch = useCallback(() => {
    if (!socketRef.current || !roomId) return;
    setErrorMsg('');
    socketRef.current.emit('start_match', { roomId, difficulty });
  }, [roomId, difficulty]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setRoomId('');
    setJoinCode('');
    setPlayers([]);
    setProblem(null);
    setWinner(null);
    setDurationSeconds(0);
    setErrorMsg('');
    setMatchOverMessage('');
    setElapsedTime(0);
  }, []);

  return {
    phase,
    roomId,
    joinCode,
    setJoinCode,
    players,
    problem,
    winner,
    durationSeconds,
    errorMsg,
    difficulty,
    setDifficulty,
    elapsedTime,
    matchOverMessage,
    handleCreateRoom,
    handleJoinRoom,
    handleStartMatch,
    handleReset,
  };
}
