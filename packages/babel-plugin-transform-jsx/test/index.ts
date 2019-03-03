import { format } from 'prettier';
var assert = require('assert');
var babel = require('@babel/core');
var chalk = require('chalk');
var clear = require('clear');
var diff = require('diff');
import * as fs from 'fs';
var path = require('path');
import 'better-log/install';
require('@babel/register');

process.env['IS_TEST'] = 'true';

// TODO https://github.com/stryker-mutator/robobar-example

////////////////////////////////////////////////////////////////////////////
var RUN_SINGLE_TEST = null;
// RUN_SINGLE_TEST = 'array-map-updatelist-1';
// RUN_SINGLE_TEST = 'attribute-call-import-3';

// RUN_SINGLE_TEST = 'assignment-3';
// RUN_SINGLE_TEST = 'class-property-1';
RUN_SINGLE_TEST = "class-name-fn-call-2"
////////////////////////////////////////////////////////////////////////////

var pluginPath = require.resolve('../src');
var exitCode = 0;

function runTests() {
	var testsPath = __dirname + '/fixtures/';
	var testList = null;

	if (!RUN_SINGLE_TEST) {
		testList = fs
			.readdirSync(testsPath)
			.map(function (item) {
				return {
					path: path.join(testsPath, item),
					name: item
				};
			})
			.filter(function (item) {
				return fs.statSync(item.path).isDirectory();
			});
	} else
		testList = [
			{
				path: './test/fixtures/' + RUN_SINGLE_TEST,
				name: RUN_SINGLE_TEST
			}
		];
	return testList.map(runTest).reduce((acc, cur) => acc + cur, 0);
}

function runTest(dir) {
	if (dir.name.startsWith('_')) {
		return;
	}
	let testFile = dir.path + '/actual.jsx';
	if (fs.existsSync(testFile) == false) {
		testFile = dir.path + '/actual.tsx';
	}
	var output = babel.transformFileSync(testFile, {
		plugins: [
			pluginPath,
			'@babel/plugin-syntax-dynamic-import',
			['@babel/plugin-proposal-decorators', { legacy: true }],
			['@babel/plugin-proposal-class-properties', { loose: true }]
		],
		presets: ['@babel/preset-typescript']
	});

	var expected = fs.readFileSync(dir.path + '/expected.js', 'utf-8');

	process.stdout.write(chalk.bgWhite.black(dir.name));
	process.stdout.write('\n');

	function normalizeLines(str: string) {
		str = format(str, {
			parser: testFile.endsWith('.tsx') ? 'typescript' : 'babel'
		});
		str = str.replace(/\r\n/g, '\n');
		str = str.replace(/; \/\//g, ';\n\\');
		str = str.replace(/\n\n/g, '\n');
		str = str
			.split('\n')
			.map((line) => {
				return line.indexOf('use strict') !== -1 ? null : line;
			})
			.filter((line) => line != null)
			.join('\n');
		str = str.replace(/; /g, ';');
		return str.replace(/\r/g, '').trim();
	}

	const diffParts = diff.diffLines(normalizeLines(output.code), normalizeLines(expected));

	const formattedOutput = normalizeLines(output.code);
	const formattedExpected = normalizeLines(expected);
	if (formattedOutput == formattedExpected) {
		process.stdout.write('√');
	} else {
		if (diffParts.length == 1) process.stdout.write('√');
		else
			diffParts.forEach(function (part) {
				var value = part.value;
				if (part.added) {
					value = chalk.green(value);
				} else if (part.removed) {
					value = chalk.red(value);
					exitCode = 1;
				}
				process.stdout.write(value);
			});
	}

	process.stdout.write('\n');

	return exitCode;
}

if (process.argv.indexOf('--watch') >= 0) {
	require('watch').watchTree(__dirname + '/..', function () {
		delete require.cache[pluginPath];
		clear();
		console.log('Press Ctrl+C to stop watching...');
		console.log('================================');
		try {
			runTests();
		} catch (e) {
			console.error(chalk.magenta(e.stack));
		}
	});
} else {
	runTests();
	process.exit(exitCode);
}
