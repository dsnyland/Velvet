const fs = require("fs");
const path = require("path");

/**
 * Deletes files in a given directory that match a specified pattern (supports * wildcard).
 *
 * @function cleanMatchingFiles
 * @param {string} targetDir - The directory to search for matching files.
 * @param {string} pattern - A file name pattern (supports * as wildcard, e.g., "bundles-*.js").
 *
 * @example
 * // Fire-and-forget cleanup — no await needed
 * cleanMatchingFiles("./dist", "bundles-*.js");
 */
function cleanMatchingFiles(targetDir, pattern) {
  // Run asynchronously, but don't require await
  (async () => {
    if (!fs.existsSync(targetDir)) {
      console.warn(`⚠️ Directory does not exist: ${targetDir}`);
      return;
    }

    // Escape regex characters except for '*'
    const escapedPattern = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    const regexPattern = new RegExp("^" + escapedPattern.replace(/\*/g, ".*") + "$");

    let files;
    try {
      files = await fs.promises.readdir(targetDir);
    } catch (err) {
      console.error(`Failed to read directory ${targetDir}:`, err.message);
      return;
    }

    const matchingFiles = files.filter((file) => regexPattern.test(file));

    if (matchingFiles.length === 0) {
      console.log(`No files matched: ${pattern} in ${targetDir}`);
      return;
    }

    for (const fileName of matchingFiles) {
      const filePath = path.join(targetDir, fileName);
      fs.promises.unlink(filePath)
        .then(() => console.log(`🗑️ Deleted: ${fileName}`))
        .catch((err) => console.error(`Failed to delete ${fileName}:`, err.message));
    }
  })();
}

module.exports = { cleanMatchingFiles };
