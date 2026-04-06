const { LeetCode } = require('leetcode-query');

async function test() {
    const lc = new LeetCode();
    try {
        const user = await lc.user('alfaarghya');
        console.log(JSON.stringify(user, null, 2));
    } catch(e) {
        console.error(e);
    }
}

test();
