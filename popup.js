let fileInput = document.getElementById('file-input');
let fileContents = document.getElementById('file-contents');

fileInput.addEventListener('change', async function() {
  let fileHandle = await window.chooseFileSystemEntries({
    type: 'open-file'
  });

  let lastModifiedTime = await getFileLastModifiedTime(fileHandle);
  let file = await getFile(fileHandle);
  fileContents.textContent = file;

  let watcher = await getFileWatcher(fileHandle);
  watcher.addEventListener('change', async function() {
    if (await getFileLastModifiedTime(fileHandle) !== lastModifiedTime) {
      lastModifiedTime = await getFileLastModifiedTime(fileHandle);
      file = await getFile(fileHandle);
      fileContents.textContent = file;
    }
  });
});

async function getFileLastModifiedTime(fileHandle) {
  let file = await fileHandle.getFile();
  return file.lastModified;
}

async function getFile(fileHandle) {
  let file = await fileHandle.getFile();
  let fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = function(e) {
      resolve(e.target.result);
    };
    fileReader.onerror = function(e) {
      reject(e);
    };
    fileReader.readAsText(file);
  });
}

async function getFileWatcher(fileHandle) {
  let writer = await fileHandle.createWriter();
  writer.truncate(0);
  let watcher = await writer.watch();
  return watcher;
}
