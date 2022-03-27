const sqlite3 = require('sqlite3').verbose()
const { response } = require('express')
const express = require('express')
const router = express.Router()
const fs = require('fs')

var db
//var user

router.get('/setdb/:selectedCourse', (req, res) => {
  db = new sqlite3.Database("./"+req.params.selectedCourse, (err) => {
      if (err) {
          console.log('Error when connecting to course file: '+req.params.selectedCourse, err)
          res.send('Error when connecting to course file: '+req.params.selectedCourse, err)
      } else {
          console.log('Database '+req.params.selectedCourse+ ' connected!')
          res.send('Database '+req.params.selectedCourse+ ' connected!')
        }
  })


})

/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works')
})

/* GET api listing. */
router.get('/courselist', (req, res) => {
  var courselist = []
  fs.readdir('.', (err, files) => {
    files.forEach(file => {
//      console.log(file)
      if(file.slice(file.lastIndexOf('.'))==".bkey"){
 //       console.log(file)
        courselist.push(file)
      }
    })
    if(courselist.length>0){
      courselist.forEach(course => {
        console.log(course)
      })
      res.json(courselist)
    } else{
      res.send("No courses found!")
    }
  })


})

/* Get words for SentenceID. */
router.get('/words', (req, res, next) => {
  console.log('Route get words for SentenceID')
  var sql = "SELECT  RowPosition, SentenceID, Column1, Column2 FROM Words WHERE SentenceID=? AND Chapter=? ORDER BY RowPosition"
  var params = [req.query.wordid, req.query.chapterid]
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
  console.log('Route get all sentences with ChapterId: '+req.query.chapterid)
  var sql = "SELECT SentenceID FROM Words WHERE Chapter=? GROUP BY SentenceID ORDER BY SentenceID"
  var params = [req.query.chapterid]
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
  var sql = "SELECT ID, Name FROM Chapters ORDER BY ID"
  var params = []
  db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({"error":err.message})
        return
      }
      res.status(200).json(rows)
    })
})

/* Update Chapter */
router.post('/updatechaptername', (req, res) =>{
  console.log('Entering Update Chapter Name - newName: '+req.body.newChapterName+' ChapterID: '+req.body.ChapterID);
  var params = [req.body.newChapterName, req.body.ChapterID];
  db.run("UPDATE Chapters SET Name = ? WHERE ID = ?", params);
  res.json({ "message":"success" })
})

/* Insert New Chapter */
router.post('/insertnewchapter', (req, res) =>{
  console.log('Entering Insert New Chapter - ChapterID: '+req.body.newChapterID+' Name: '+req.body.newChapterName)
  var params = [req.body.newChapterID, req.body.newChapterName];
  db.run("INSERT INTO Chapters (ID, Name) VALUES(?, ?) ", params);
  res.json({ "message":"success" })
})

/* Update Row */
router.post('/updaterow', (req, res) =>{
  console.log('Entering Update Row - SentenceID: '+req.body.row.SentenceID+' RowPosition: '+req.body.row.RowPosition
      +' Column1: '+req.body.row.Column1+' Column2: '+req.body.row.Column2+' ChapterID: '+req.body.row.ChapterID);
  var params = [req.body.row.Column1, req.body.row.Column2, req.body.row.SentenceID, req.body.row.RowPosition, req.body.row.ChapterID];
  db.run("UPDATE Words SET Column1 = ?, Column2 = ? WHERE SentenceID = ? AND RowPosition = ? AND Chapter = ?", params);
  res.json({ "message":"success" })
})

/* Insert Row */
router.post('/insertrow', (req, res) =>{
  console.log('Entering Insert Row - SentenceID: '+req.body.row.SentenceID+' RowPosition: '+req.body.row.RowPosition
    +' Column1: '+req.body.row.Column1+' Column2: '+req.body.row.Column2+' ChapterID: '+req.body.row.ChapterID);
  var params = [req.body.row.SentenceID, req.body.row.RowPosition, req.body.row.Column1, req.body.row.Column2, req.body.row.ChapterID];
  db.run("INSERT INTO Words (ID, SentenceID, RowPosition, Column1, Column2, Chapter) VALUES ((SELECT max(ID) from words)+1, ?, ?, ?, ?, ?) ", params);
  res.json({ "message":"success" })
})

/* Delete Row */
router.post('/deleterow', (req, res) =>{
  console.log('Entering Delete Row - SentenceID: '+req.body.row.SentenceID+' RowPosition: '+req.body.row.RowPosition
    +' Column1: '+req.body.row.Column1+' Column2: '+req.body.row.Column2+' ChapterID: '+req.body.row.ChapterID);
  var params = [req.body.row.SentenceID, req.body.row.RowPosition, req.body.row.ChapterID]
  db.run("DELETE FROM Words WHERE SentenceID = ? AND RowPosition = ? AND Chapter = ?", params)
  res.json({ "message":"success" })
})


router.get('/audio', (req, res) => {
  console.log('Route get audio with SentenceId: '+req.query.wordid+' and ChapterId: '+req.query.chapterid)
  var sql = "SELECT Audio FROM Blobs WHERE SentenceID=? AND ChapterID=?"
  var params = [req.query.wordid, req.query.chapterid]

    db.get(sql, params, (err, blob) => {
      if (err) {
        res.status(400).json({"error":err.message})
      }
      if(blob){
        res.contentType('audio/mp3')
        res.end(Buffer.from(blob.Audio, 'binary'))
      } else{
        res.status(200).send('audio not found')
      }
    })

})

/* Delete Row */
router.post('/saveaudio', (req, res) =>{
  console.log('Entering Save Audio with SentenceId: '+req.body.SentenceID+' and ChapterId: '+req.body.ChapterID);
  var buffer= req.files.AudioFile.data
    db.get("SELECT count(*) AS 'count' FROM Blobs  WHERE SentenceID=? AND ChapterID=?", [req.body.SentenceID, req.body.ChapterID], (err, row) => {
        console.log(row)
        if (err) {
          res.status(400).json({"error":err.message})
        }
        if(row.count>0){
          console.log("count > 0, SentenceID found")
          db.run("UPDATE Blobs SET Audio = ? WHERE SentenceID = ? AND ChapterID=?", [buffer, req.body.SentenceID, req.body.ChapterID]);
        } else {
          console.log("count = 0, SentenceID not found")
          db.run("INSERT INTO Blobs (SentenceID, ChapterID, Audio) VALUES (?, ?, ?) ", [req.body.SentenceID, req.body.ChapterID, buffer])
        }
    })
    res.json({ "message":"success" })
  })


module.exports = router
