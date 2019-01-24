import request from 'request'
import fs from 'fs'
import DecompressZip from 'decompress-zip'
import nodeCmd from 'node-cmd'

export function downloadFile (configuration) {
  return new Promise(function(resolve, reject){
    // Save variable to know progress
    var received_bytes = 0
    var total_bytes = 0

    var req = request({
      method: 'GET',
      uri: configuration.remoteFile
    })

    var out = fs.createWriteStream(configuration.localFile)
    req.pipe(out)

    req.on('response', function ( data ) {
      // Change the total bytes value to get progress later.
      total_bytes = parseInt(data.headers['content-length' ])
    })

    // Get progress if callback exists
    if(configuration.hasOwnProperty('onProgress')){
      req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length

        configuration.onProgress(received_bytes, total_bytes)
      })
    }else{
      req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length
      })
    }

    req.on('end', function() {
      resolve()
    })
  })
}

export function extract (source, dest) {
  return new Promise((resolve, reject) => {
    let unzipper = new DecompressZip(source)
    // Add the error event listener
    unzipper.on('error', function (err) {
      console.log('Caught an error', err)
      reject(err)
    })
    // Notify when everything is extracted
    unzipper.on('extract', function (log) {
      console.log('Finished extracting', log)
      // Delete zip
      nodeCmd.get(`rm -rf ${source}`, (err, data, stderr) => console.log(data))
      resolve(log)
    })
    // Notify "progress" of the decompressed files
    unzipper.on('progress', function (fileIndex, fileCount) {
      console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount)
    })
    unzipper.extract({
      path: dest
    })
  })
}