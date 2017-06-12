# mboxtract
Extract attachments from (tremendously huge) mbox files.

Places all the attachments in a directory.

Use `subdirs` to put all attachments into a subdirectory based on the date of the mail they are extracted from. 

This was originally created to process an 80.6GB file extracted from GMail.

# Usage
## Command Line
```
npm install -g mboxtract
mboxtract --subdirs -o attachments mymbox.mbox
```

## NodeJS
```
var mboxtract = require("mboxtract");
mboxtract.extract({
	outputDir: "attachments",
	subDirs: true,
	mboxFile: "mymbox.mbox"
});
```
