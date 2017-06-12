#!/usr/bin/env node
/**
 * CLI for mboxtract
 *
 * Pass this script the path to the mbox file OR pipe it on stdin and use the following options:
 * -o /path/to/output/directory Must be provided.
 * --subdirs If true then attachments will be placed in a subdirectory corresponding to the mail date.
 * --dryrun If provided then this is a dry run and no output files will be written (but the directories may be created).
 *
 * Created by Rick Brown 2017-06-10.
 */
var extractor = require("./index"),
	parseArgs = require("minimist");

const USAGE = "mboxtract -o /path/to/output/dir [--dryrun] [--subdirs] [/path/to/file.mbox]";

main();

/**
 * Process command line args and run the extraction.
 */
function main() {
	var config, argv = parseArgs(process.argv.slice(2), { boolean: true });
	if (argv && argv.o) {
		config = {
			outputDir: argv.o,
			dryRun: argv.dryrun,
			subDirs: argv.subdirs,
			mboxFile: argv._[0]
		};
		extractor.extract(config);
	} else {
		console.log(USAGE);
	}
}
