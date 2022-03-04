const sqlite3 = require('sqlite3').verbose()
const express = require('express')
const router = express.Router()

//var user

let db = new sqlite3.Database("./estepais.db", (err) => {
    if (err) {
        console.log('Error when connecting to estepais.db', err)
    } else {
        console.log('Database connected!')
    }
})

/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works')
})

/* Get words for SentenceID. */
router.get('/words/:id', (req, res, next) => {
  console.log('Route get words for SentenceID')
  var sql = "SELECT  RowPosition, SentenceID, Column1, Column2 FROM Words WHERE SentenceID=? ORDER BY RowPosition"
  var params = [req.params.id]
  db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({"error":err.message})
        return;
      }
      res.status(200).json(rows)
    })
})

/* Get all sentences  */
router.get('/sentences', (req, res) => {
  console.log('Route get all sentences')
  var sql = "SELECT SentenceID FROM Words GROUP BY SentenceID ORDER BY SentenceID"
  var params = []
  db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({"error":err.message})
        return
      }
 //     console.log(rows);
      var sentenceArray = rows.map(function(value) {
        return value.SentenceID
    })
 //     console.log(sentenceArray);
      res.status(200).json(sentenceArray)
    })
})

/* Get all chapters  */
router.get('/chapters', (req, res) => {
  console.log('Route get all chapters')
  var sql = "SELECT ID, chapterBegins,chapterEnds,Description FROM Chapters ORDER BY ID"
  var params = []
  db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({"error":err.message})
        return
      }
      res.status(200).json(rows)
    })
})

/* Update Row */
router.post('/updaterow', (req, res) =>{
  console.log('Entering Update Row - SentenceID: '+req.body.row.SentenceID+' RowPosition: '+req.body.row.RowPosition+' Column1: '+req.body.row.Column1+' Column2: '+req.body.row.Column2);
  var params = [req.body.row.Column1, req.body.row.Column2, req.body.row.SentenceID, req.body.row.RowPosition];
  db.run("UPDATE Words SET Column1 = ?, Column2 = ? WHERE SentenceID = ? AND RowPosition = ?", params);
  res.json({
      "message":"success"
  })
})

/* Insert Row */
router.post('/insertrow', (req, res) =>{
  console.log('Entering Insert Row - SentenceID: '+req.body.row.SentenceID+' RowPosition: '+req.body.row.RowPosition+' Column1: '+req.body.row.Column1+' Column2: '+req.body.row.Column2);
  var params = [req.body.row.SentenceID, req.body.row.RowPosition, req.body.row.Column1, req.body.row.Column2];
  db.run("INSERT INTO Words (ID, SentenceID, RowPosition, Column1, Column2) VALUES ((SELECT max(ID) from words)+1, ?, ?, ?, ?) ", params);
  res.json({
    "message":"success"
  })
})

/* Delete Row */
router.post('/deleterow', (req, res) =>{
  console.log('Entering Delete Row - SentenceID: '+req.body.row.SentenceID+' RowPosition: '+req.body.row.RowPosition+' Column1: '+req.body.row.Column1+' Column2: '+req.body.row.Column2);
  var params = [req.body.row.SentenceID, req.body.row.RowPosition]
  db.run("DELETE FROM Words WHERE SentenceID = ? AND RowPosition = ?", params)
  res.json({
      "message":"success"
  })
})


router.get('/audio/:id', (req, res) => {
  console.log('Route get audio with SentenceId: '+req.params.id)
  var sql = "SELECT Audio FROM Blobs WHERE SentenceID = ?"
  var params = [req.params.id]

    db.get(sql, params, (err, blob) => {
      if (err) {
        res.status(400).json({"error":err.message})
      }
      if(blob){
        res.contentType('audio/mp3')
        res.end(Buffer.from(blob.Audio, 'binary'))
      } else{
        res.status(404).send('audio not found')
      }
    })

})

/* Delete Row */
router.post('/saveaudio/:id', (req, res) =>{
  console.log('Entering Save Audio with SentenceID: '+req.params.id);
  var buffer= req.files.AudioFile.data
    db.get("SELECT count(*) AS 'count' FROM Blobs WHERE SentenceID = ?", [req.params.id], (err, row) => {
        console.log(row)
        if (err) {
          res.status(400).json({"error":err.message})
        }
        if(row.count>0){
          console.log("count > 0, SentenceID found")
          db.run("UPDATE Blobs SET Audio = ? WHERE SentenceID = ?", [buffer, req.params.id]);
        } else {
          console.log("count = 0, SentenceID not found")
          db.run("INSERT INTO Blobs (SentenceID, Audio) VALUES (?, ?) ", [req.params.id, buffer])
        }
    })
  res.json({
    "message":"success"
  })
})


module.exports = router
