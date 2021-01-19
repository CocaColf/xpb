module.exports = {
    collectCoverage: true,
    coveragePathIgnorePatterns: ['types', 'node_modules'],
    modulePathIgnorePatterns: ['node_modules'],
    collectCoverageFrom: ['lib/common/*.ts'],
    roots: [
        "<rootDir>/test" // 测试目录
    ]
}