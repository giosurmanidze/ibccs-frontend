const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

// Configuration
const directories = ["components", "pages", "src"]; // Add any other directories you want to search
const extensions = [".js", ".jsx", ".tsx"];

async function findFilesRecursively(dir) {
  const files = await fs.promises.readdir(dir);
  const results = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      results.push(...(await findFilesRecursively(filePath)));
    } else if (extensions.includes(path.extname(file))) {
      results.push(filePath);
    }
  }

  return results;
}

async function checkFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8");

    // Regular expressions to match Image components
    const nextImageRegex = /<Image(?![^>]*\bsrc=)[^>]*>/g;
    const imgRegex = /<img(?![^>]*\bsrc=)[^>]*>/g;

    const nextImageMatches = content.match(nextImageRegex) || [];
    const imgMatches = content.match(imgRegex) || [];

    if (nextImageMatches.length > 0 || imgMatches.length > 0) {
      console.log(`\nFile: ${filePath}`);

      if (nextImageMatches.length > 0) {
        console.log("Next.js Image components missing src:");
        nextImageMatches.forEach((match, index) => {
          console.log(`  ${index + 1}. ${match}`);
        });
      }

      if (imgMatches.length > 0) {
        console.log("HTML img tags missing src:");
        imgMatches.forEach((match, index) => {
          console.log(`  ${index + 1}. ${match}`);
        });
      }

      // Get line numbers for matches
      const lines = content.split("\n");
      let lineNumber = 1;
      lines.forEach((line) => {
        if (line.match(nextImageRegex) || line.match(imgRegex)) {
          console.log(`  Found at line: ${lineNumber}`);
        }
        lineNumber++;
      });
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
}

async function main() {
  try {
    console.log("Searching for Image components missing src attribute...\n");

    // Get all files from specified directories
    const allFiles = [];
    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        allFiles.push(...(await findFilesRecursively(dir)));
      }
    }

    // Check each file
    for (const file of allFiles) {
      await checkFile(file);
    }

    console.log("\nSearch completed!");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the script
main();
