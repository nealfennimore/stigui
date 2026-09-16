// jest.config.ts
import { createDefaultPreset, JestConfigWithTsJest } from 'ts-jest'

const moduleNameMapper = {
  '^@/(.*)$': '<rootDir>/src/$1',
}

// The ui project needs jest-environment-jsdom and @testing-library/*.
// Skip it (with a warning) until those devDependencies are installed, so
// `npm test` still runs the api suite in a partial environment.
const uiProject = (() => {
  try {
    require.resolve('jest-environment-jsdom')
    return [
      {
        displayName: 'ui',
        ...createDefaultPreset({
          tsconfig: {
            jsx: 'react-jsx',
          },
        }),
        testEnvironment: 'jsdom',
        testMatch: ['<rootDir>/src/app/**/*.spec.tsx'],
        setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
        moduleNameMapper,
      },
    ]
  } catch {
    console.warn(
      'jest-environment-jsdom is not installed; skipping the ui test project.'
    )
    return []
  }
})()

const jestConfig: JestConfigWithTsJest = {
  projects: [
    {
      displayName: 'api',
      ...createDefaultPreset(),
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/api/**/*.spec.ts'],
      moduleNameMapper,
    },
    ...uiProject,
  ],
}

export default jestConfig
