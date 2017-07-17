/**
 * Extracts all attachments from a .mbox file.
 * This is designed to process HUGE mbox files; it was created to process an 80.6GB file extracted from GMail.
 *
 * Created by Rick Brown 2017-06-10.
 */
var fs = require("fs"),
	MailParser = require("mailparser").MailParser,
	Mbox = require("node-mbox"),
	path = require("path");


/**
 * Extracts attachments from mbox.
 * @param config An object with properties as shown below:
 * @param {String} config.outputDir The path to the output directory.
 * @param {Boolean} [config.dryRun] If true do not write any files to the output directory.
 * @param {Boolean} [config.subDirs] If true create a sub directory for each day.
 * @param {String} [config.mboxFile] The path to the mbox file. If not provided you must pipe the mbox on stdin.
 */
function extract(config) {
	var mbox;
	if (config.outputDir) {
		ensureDirectoryExistence(config.outputDir);
		mbox = instantiateMbox(config.outputDir, !!config.dryRun, !!config.subDirs);
		if (!config.mboxFile) {
			console.log("No mbox file provided. Waiting for stdin.");
		}
		streamMbox(mbox, config.mboxFile);
	} else {
		console.log("Must specify outputDir");
	}
}

/**
 * Creates an instance of Mbox ready to run.
 * @param {String} outputDir The path to the output directory.
 * @param {Boolean} dryRun If true do not write any files to the output directory.
 * @param {Boolean} subDirs If true create a sub directory for each day.
 * @returns {Mbox} An instance of node-mbox.
 */
function instantiateMbox(outputDir, dryRun, subDirs) {
	var mbox = new Mbox();
	mbox.on("message", function (msg) {
		var currentDir = outputDir,
			mailParser = new MailParser({ streamAttachments: true });

		if (subDirs) {
			mailParser.on("headers", function(headers) {
				var dirName, mailDate, headerDate = headers.get("date");
				if (headerDate) {
					try {
						mailDate = new Date(headerDate);  // converting to date should adjust for locale
						dirName = [mailDate.getFullYear(), pad(mailDate.getMonth() + 1), pad(mailDate.getDate())];
						dirName = dirName.join("-");
						currentDir = path.join(outputDir, dirName);
						ensureDirectoryExistence(currentDir);
					} catch (ex) {
						console.error("Could not parse date ", headerDate);
					}
				}
				console.log(headers.get("date"));
			});
		}

		mailParser.on("data", function (data) {
			var myFile, fileToWrite;
			if (data.type === "attachment" && data.filename) {
				fileToWrite = path.join(currentDir, data.filename);
				console.log(data.filename);
				if (!dryRun) {
					myFile = fs.createWriteStream(fileToWrite);
					data.content.pipe(myFile);
				}
				data.release();
			}
		});
		mailParser.write(msg);
		mailParser.end();
	});
	return mbox;
}

function pad(num) {
	var result = "0" + num;
	return result.slice(-2);
}

/**
 * Once the event listeners are ready to go, let's start piping an mbox.
 * @param {Mbox} mbox An instance of node-mbox.
 * @param {String} [mboxFile] The path to the mbox file. If not provided you must pipe the mbox on stdin.
 */
function streamMbox(mbox, mboxFile) {
	var mboxStream;
	if (!mboxFile) {
		mboxStream = process.stdin;
	} else if (fs.existsSync(mboxFile)) {
		mboxStream = fs.createReadStream(mboxFile);
	} else {
		console.log("Can't find your mbox file", mboxFile);
		return;
	}
	mboxStream.pipe(mbox);
}

/**
 * Ensures the directory exists and creates it if it doesn't.
 * @param dirName The path to the directory.
 */
function ensureDirectoryExistence(dirName) {
	if (!fs.existsSync(dirName)) {
		fs.mkdirSync(dirName);
	}
}

module.exports = {
	extract: extract
};
