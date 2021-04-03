import { format } from 'prettier';
import * as chalk from 'chalk';
import * as babel from '@babel/core';
import * as diff from 'diff';
import * as fs from 'fs';
import * as path from 'path';
import '../node_modules/better-log/install';
import '@babel/register';
import { globalData } from '../src/common';

process.env['IS_TEST'] = 'true';

// TODO https://github.com/stryker-mutator/robobar-example

////////////////////////////////////////////////////////////////////////////
var RUN_SINGLE_TEST = process.argv[2];
if (!RUN_SINGLE_TEST) {
  // RUN_SINGLE_TEST = 'todomvc';
}

var exitCode = 0;

function runTests() {
  var testsPath = __dirname + '/fixtures/';
  var testList = null;

  if (!RUN_SINGLE_TEST) {
    testList = fs
      .readdirSync(testsPath)
      .map(function(item) {
        return {
          path: path.join(testsPath, item),
          name: item,
        };
      })
      .filter(function(item) {
        return fs.statSync(item.path).isDirectory();
      });
  } else
    testList = [
      {
        path: './test/fixtures/' + RUN_SINGLE_TEST,
        name: RUN_SINGLE_TEST,
      },
    ];
  return testList.map(runTest).reduce((acc, cur) => acc + cur, 0);
}

function runTest(dir) {
  if (dir.name.startsWith('_')) {
    return 0;
  }
  let testFile = dir.path + '/actual.jsx';
  if (fs.existsSync(testFile) === false) {
    testFile = dir.path + '/actual.tsx';
  }
  var output = babel.transformFileSync(
    testFile,
    globalData.babelConfig(
      process.env.IS_TEST ? './src/index.ts' : './dist/index.js'
    )
  );

  var expected = fs.readFileSync(dir.path + '/expected.js', 'utf-8');
  process.stdout.write(chalk.bgWhite.blue(dir.name));
  process.stdout.write('\n');

  function normalizeLines(str: string) {
    str = str.replace(/\t/g, ' ');
    try {
      str = format(str, {
        parser: testFile.endsWith('.tsx') ? 'typescript' : 'babel',
      });
    } catch (e) {
      console.error(e);
    }
    str = str.replace(/\r\n/g, '\n');
    str = str.replace(/; \/\//g, ';\n\\');
    str = str.replace(/\n\n/g, '\n');
    str = str
      .split('\n')
      .map(line => {
        return line.indexOf('use strict') !== -1 ? null : line;
      })
      .filter(line => line != null)
      .join('\n');
    str = str.replace(/; /g, ';');
    return str.replace(/\r/g, '').trim();
  }

  const formattedOutput = normalizeLines(output.code);
  const formattedExpected = normalizeLines(expected);
  const diffParts = diff.diffLines(formattedOutput, formattedExpected);

  if (formattedOutput == formattedExpected) {
    process.stdout.write('√');
  } else {
    if (diffParts.length == 1) process.stdout.write('√');
    else {
      diffParts.forEach(function(part) {
        var value = part.value;
        if (part.added) {
          value = chalk.green(value);
        } else if (part.removed) {
          value = chalk.red(value);
          exitCode = 1;
        }
        process.stdout.write(value);
      });
      drawLine('Expected ' + dir.path);
      process.stdout.write(chalk.red(formattedExpected));
      drawLine('Output ' + dir.path);
      process.stdout.write(chalk.yellow(formattedOutput));
    }
  }

  process.stdout.write('\n');

  return exitCode;
}

const drawLine = (title?: string) => {
  process.stdout.write(
    chalk.bgWhite.black(
      '\n------------' +
        (title || '') +
        '-------------------------------------------------------------------------------------------\n'
    )
  );
};

if (process.argv.indexOf('--watch') >= 0) {
  // require('watch').watchTree(__dirname + '/..', function() {
  // 	delete require.cache[pluginPath];
  // 	clear();
  // 	console.log('Press Ctrl+C to stop watching...');
  // 	console.log('================================');
  // 	try {
  // 		runTests();
  // 	} catch (e) {
  // 		console.error(chalk.magenta(e.stack));
  // 	}
  // });
} else {
  runTests();
  process.exit(exitCode);
}
