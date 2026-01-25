const difficulty = {
    0: {
        description: "Very easy",
        UciEloRange: [400, 800],
        skillLevelRange: [0, 2],
        moveTimeRange: [200, 500],
        depthRange: [1, 1],
        limitStrength: true,
    },
    1: {
        description: "Easy",
        UciEloRange: [800, 1200],
        skillLevelRange: [3, 6],
        moveTimeRange: [500, 1000],
        depthRange: [2, 4],
        limitStrength: true,
    },
    2: {
        description: "Medium",
        UciEloRange: [1200, 2000],
        skillLevelRange: [7, 12],
        moveTimeRange: [1000, 2000],
        depthRange: [5, 9],
        limitStrength: true,
    },
    3: {
        description: "Hard",
        UciEloRange: null,
        skillLevelRange: [13, 18],
        moveTimeRange: [2000, 6000],
        depthRange: [10, 19],
        limitStrength: false,
    },
    4: {
        description: "Very hard",
        UciEloRange: null,
        skillLevelRange: [19, 20],
        moveTimeRange: [10000, 20000],
        depthRange: [20, 32],
        limitStrength: false,
    }
}

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function D(d = 1) {
    const result = {
        uciElo: difficulty[d].UciEloRange
            ? getRandomInt( difficulty[d].UciEloRange[0], difficulty[d].UciEloRange[1] )
            : null,
        skillLevel: getRandomInt( difficulty[d].skillLevelRange[0], difficulty[d].skillLevelRange[1] ),
        moveTime: getRandomInt( difficulty[d].moveTimeRange[0], difficulty[d].moveTimeRange[1] ),
        depth: getRandomInt( difficulty[d].depthRange[0], difficulty[d].depthRange[1] ),
        limitStrength: difficulty[d].limitStrength,
    };
    return result;
}