import React, { Component } from 'react';
import beginning from  "../assets/beginning.png";
import arrow_left from  "../assets/arrow_left.png";
import arrow_right from  "../assets/arrow_right.png";
import end from  "../assets/end.png";
import '../App.css';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
//import audioIcon from '../assets/icons8-ios-50.png';


class SentenceView extends Component {
    constructor() {
        super()
        this.state = {
            words: [],
            sentences: [],
            chapters: [],
            sentencePointer: 0,
            currentSentence: 1,
            chapterPointer: 0,
            currentChapter: 1,
            chapterName: "",
            newChapterName: "",
            newChapterID: 0,
            editedChapterName: "",
            saveButtonVariant: "success",
            audioPath: "",
            audioIcon: "icons8-ios-50.png",
            playButtonTitle: "Play audio...",
            setAudioFileTitle: "Set audio file...",
            audioUploadObject: null,
            audioChanged: false,
            audioFile: null,
            showEditChapterDialog: false,
            showNewChapterDialog: false,
            chapterPersistPending: false
        }
        this.sentenceTable = React.createRef()
        this.audioControl = React.createRef();
        this.audioUploader = React.createRef();
    }
    componentDidMount = async () => {
        this.initEditor()
    }
    initEditor(){
        axios.get('http://localhost:3001/sentences', { params: { chapterid: this.state.currentChapter }}
        ).then((response) => {
            const statefulData = response.data
            this.setState({sentences: statefulData})
            console.log("sentences: "+statefulData)
            this.setState((state) => ({currentSentence: statefulData[state.sentencePointer]}))
        }).catch((error) => {
          console.log("Error occurred while fetching Sentences")
          console.error(error)
        })
        
        axios.get('http://localhost:3001/chapters', { params: {}}
        ).then((response) => {
            const statefulData = response.data
            this.setState({chapters: statefulData})
            console.log("chapters: "+JSON.stringify(statefulData))
            this.setState((state) => ({
                    currentChapter: statefulData[state.chapterPointer].ID,
                    chapterName: statefulData[state.chapterPointer].Name                   
                })
            )
        }).catch((error) => {
          console.log("Error occurred while fetching Chapters")
          console.error(error)
        })
        
        this.getCurrentSentence()

    }
    handleFormSubmit() {
        console.log("entering handleFormSubmit")
    }
    handleOnWordChange(index, e){
        console.log("Entering handleOnWordChange. index: "+index)
        console.log("target.value: "+e.target.value)
        console.log("target.name: "+e.target.name)
        this.setState((state) => ({ saveButtonVariant: "warning" }) )
        let indexElementState = this.state.words[index].State
        if(indexElementState === 0 || indexElementState === 1) {
            console.log("indexElementState = 0")
            this.setState(state => {
                const words = state.words.map((row, j) => {
                    if (j === index) { 
                        if(e.target.name === "OriginalText"){
                            row.Column1 = e.target.value
                            row.State = 1    
                        }
                        else if(e.target.name === "TranslatedText"){
                            row.Column2 = e.target.value
                            row.State = 1    
                        }
                        return row 
                    } 
                    else { return row }
                  })            
                  return {
                    words,
                  }
            })
        }
        else if(indexElementState === 3 || indexElementState === 4) {
            console.log("indexElementState = 3")
            this.setState(state => {
                const words = state.words.map((row, j) => {
                    if (j === index) { 
                        if(e.target.name === "OriginalText"){
                            row.Column1 = e.target.value
                            row.State = 4    
                        }
                        else if(e.target.name === "TranslatedText"){
                            row.Column2 = e.target.value
                            row.State = 4    
                        }
                        return row
                    } 
                    else { return row }
                  })            
                  return {
                    words,
                  }
            })
        }
    }
    handleOnSentenceChange(controlName) {
        console.log("entering handleOnSentenceChange, controlName: "+controlName)
        if(this.state.saveButtonVariant === "warning"){
            this.handleSaveButton()
        }
        switch(controlName){
            case "nextSentence":
                if (this.state.sentencePointer < this.state.sentences.length-1){
                    this.setState((state) => ({
                        sentencePointer: state.sentencePointer+1,
                        currentSentence: state.sentences[state.sentencePointer+1]
                    }),  this.getCurrentSentence)    
                }
            break
            case "previousSentence":
                if (this.state.sentencePointer > 0){
                    this.setState((state) => ({
                        sentencePointer: state.sentencePointer-1,
                        currentSentence: state.sentences[state.sentencePointer-1]
                    }),  this.getCurrentSentence)
                }

            break
            case "firstSentence":
                this.setState((state) => ({
                    sentencePointer: 0,
                    currentSentence: state.sentences[0]
                }),  this.getCurrentSentence)
            
            break
            case "lastSentence":
                this.setState((state) => ({
                    sentencePointer: state.sentences.length - 1,
                    currentSentence: state.sentences[state.sentences.length - 1]
                }),  this.getCurrentSentence)
            
            break    
            default:
                console.log("entering DEFAULT handleOnSentenceChange, controlName: "+controlName)
        }
    }
    handleOnChapterChange(controlName) {
        console.log("entering handleOnChapterChange, controlName: "+controlName)
        if(this.state.saveButtonVariant === "warning"){
            this.handleSaveButton()
        }
        switch(controlName){
            case "nextChapter":
                if (this.state.chapterPointer < this.state.chapters.length-1){
                    this.setState((state) => ({
                        chapterPointer: state.chapterPointer+1,
                        currentChapter: state.chapters[state.chapterPointer+1].ID
                    }),  this.initEditor)    
                }
            break
            case "previousChapter":
                if (this.state.chapterPointer > 0){
                    this.setState((state) => ({
                        chapterPointer: state.chapterPointer-1,
                        currentChapter: state.chapters[state.chapterPointer-1].ID
                    }),  this.initEditor)
                }

            break
            default:
                console.log("entering DEFAULT handleOnChapterChange, controlName: "+controlName)
            }
        }
    handleAddRowButton(){
        console.log("Entering handleAddRowButton")
        this.setState(previousState => ({
            words: [...previousState.words, {Column1: "",
            Column2: "",
            RowPosition: this.state.words[this.state.words.length-1].RowPosition+1,
            SentenceID: this.state.words[this.state.words.length-1].SentenceID,
            State: 3}]
        }))

    }

// STATE CODES FOR ROW ELEMENT
// State=0 - Initial State (Row persisted)
// State=1 - Updated (Waiting to be persisted)
// State=2 - Deleted Row (Waiting to be persisted)
// State=3 - New Row (Row discarded when Save)
// State=4 - Updated New Row (Waiting to be persisted)

    handleSaveButton(){
        console.log("Entering handleSaveButton")
        sequentialUpdateDB(this)

        async function sequentialUpdateDB(context) {
            var wordsArray = context.state.words
            var audioFileChanged = context.state.audioChanged
            var currentSentence = context.state.currentSentence
            var audioUploadObject = context.state.audioUploadObject
            var currentChapter = context.state.currentChapter
            const promises = []
            var axiosPromiseIndex = 0
            var updatedItemIndex = []
            var deletedItemIndex = []
            try{
                wordsArray.forEach(function (item, index) {
                    if(item.State === 1 || item.State === 4 || item.State === 2) {
                        var row= {
                            SentenceID: item.SentenceID,
                            RowPosition: item.RowPosition,
                            Column1: item.Column1,
                            Column2: item.Column2,
                            ChapterID: currentChapter
                        }
                        if(item.State === 1){
                            promises[axiosPromiseIndex] = axios.post('http://localhost:3001/updaterow', { row })
                            updatedItemIndex.push(index)
                        } else if(item.State === 4) {
                            promises[axiosPromiseIndex] = axios.post('http://localhost:3001/insertrow', { row })
                            updatedItemIndex.push(index)
                        } else if(item.State === 2) {
                            promises[axiosPromiseIndex] = axios.post('http://localhost:3001/deleterow', { row })
                            deletedItemIndex.push(index)
                        }
            
                        axiosPromiseIndex = axiosPromiseIndex+1
                    }
                })
                // Save audioFile
                console.log("context.audioChanged: "+audioFileChanged)
                if(audioFileChanged){
                    console.log("post audioFile")
                    var formData = new FormData();
                    formData.append('AudioFile', audioUploadObject);
                    formData.append('SentenceID', currentSentence);
                    formData.append('ChapterID', currentChapter);
                    promises[axiosPromiseIndex] = axios.post('http://localhost:3001/saveaudio', formData)    
                }
                await Promise.all(promises)
                .then(
                    context.setState((state) => ({ saveButtonVariant: "success",
                        audioUploadObject: null,
                        audioChanged: false,
                        setAudioFileTitle: "Change audio file..."                    
                    })),
                    context.setState(state => {
                        const words = state.words.map((row, j) => {
                            updatedItemIndex.forEach(function (item) {
                                if (j === item) { 
                                    row.State = 0
                                    row.RemoveButtonVariant = "danger"
                                } 
        
                            })
                            return row
                        })   
                        deletedItemIndex.sort((a, b) => b - a)
                        deletedItemIndex.forEach(function (item) {
                            console.log("removing deletedItemIndex: "+item)
                            words.splice(item, 1)
                        })      
                        return { words, }
                    })        
                )
                .catch(e => console.log("exception in saving rows: "+e)) 
        
            } catch (error) {
                console.log(error);
            }
        }
    }
    handleDiscardButton(){
        console.log("Entering handleDiscardButton")
        this.getCurrentSentence()
        this.setState((state) => ({ saveButtonVariant: "success" }) )
    }
    handleRemoveRowButton(index, e){
        console.log("Entering handleRemoveRowButton. index: "+index)
        console.log("button name: "+e.target.name)
        if (this.state.words[index].State === 0 || this.state.words[index].State === 1){
            /// Mark row as deleted (row.State = 2), will be deleted from DB at Save            
            this.setState(state => {
                const words = state.words.map((row, j) => {
                    if (j === index) { 
                        row.State = 2
                        row.RemoveButtonVariant = "warning"
                    } 
                    return row
                })            
                return { words, }
            })
            this.setState((state) => ({ saveButtonVariant: "warning" }) )
        }
        else if (this.state.words[index].State === 3 || this.state.words[index].State === 4){
            /// remove deleted row from table, row has not been persisted to DB (State 3 or 4) 
            e.target.setAttribute("variant", "success")
            this.setState(state => {
                var words = [...state.words]
                words.splice(index, 1)
                return { words, }
            })

        }
        
    }
    handleNewSentenceButton(){
        console.log("entering getCurrenthandleNewSentenceButtonSentence")
        var newSentenceID =1  // if new sentence is added to new chapter
        var sentencePointer =0 // if new sentence is added to new chapter
        if(this.state.saveButtonVariant === "warning"){
            this.handleSaveButton()
        }
        if(this.state.sentences.length>0){  // if new sentence is added to existing chapter
            newSentenceID = this.state.sentences[this.state.sentences.length - 1]+1
            sentencePointer = this.state.sentences.length
        }
        console.log("adding new sentence with sentenceID: "+newSentenceID+" and sentencePointer: "+sentencePointer)
        var newSentence = []
         for(var i=0; i<4; i++){
            newSentence.push({Column1: "",
            Column2: "",
            RowPosition: i+1,
            SentenceID: newSentenceID,
            State: 3})     
        }
        
        this.setState(previousState => ({
            sentences: [...previousState.sentences, newSentenceID],
            currentSentence: newSentenceID,
            sentencePointer: sentencePointer,
            words: newSentence,
            audioUploadObject: null,
            audioFile: null,
            audioChanged: false,
            audioIcon: "icons8-ios-50.png",
            setAudioFileTitle: "Set audio file..."
        }))


    }
    handleFileUploader(e){
        console.log("entering handleFileUploader")
        if(e.target.files[0]){
            console.log("File found setting audioFile: "+e.target.files[0].name)
            const url = window.URL.createObjectURL(e.target.files[0])
            this.setState({audioFile: new Audio(url),
                audioIcon: "icons8-ios-filled-50.png",
                audioUploadObject: e.target.files[0],
                audioChanged: true,
                setAudioFileTitle: e.target.files[0].name,
                saveButtonVariant: "warning"
            })

        }
    }
    handlePlayAudio(){
        console.log("entering handlePlayAudio")
        if(this.state.audioFile){
            this.state.audioFile.play()
        }
    }
    handleExitButton(){
        console.log("entering handleExitButton")        
    }
    getCurrentSentence(){
        console.log("entering getCurrentSentence with id: "+this.state.currentSentence+" and chapterId: "+this.state.currentChapter)
        axios.get('http://localhost:3001/words', { params: { wordid: this.state.currentSentence, chapterid: this.state.currentChapter }}
        ).then((response) => {
           const statefulData = response.data.map(obj=> ({...obj, State: 0, RemoveButtonVariant: "danger"}))
            this.setState((previousState) => ({ 
                sentences: previousState.sentences, 
                ...previousState.sentencePointer, 
                ...previousState.currentSentence, 
                ...previousState.currentChapter, 
                words: statefulData }))
            console.log(statefulData)
        }).catch((error) => {
          console.log("Error occurred while fetching Entries")
          console.error(error)
        })  
        this.getCurrentAudio()  
    }
    getCurrentAudio(){
        axios.get('http://localhost:3001/audio', {
            params: { wordid: this.state.currentSentence, chapterid: this.state.currentChapter },    
            responseType: 'blob', 
            headers: {'Content-Type': 'audio/mp3'}
          }
        ).then((response) => {
            console.log("setting audio with response.status: "+response.status)
            const blob = new Blob([response.data], { type: 'audio/mp3' })
            const url = window.URL.createObjectURL(blob)
            this.setState({audioFile: new Audio(url),
                audioIcon: "icons8-ios-filled-50.png",
                setAudioFileTitle: "Change audio file..."
            })
        }).catch((error)=> {
            if (error.response) {
              console.log(error.response.status);
              if(error.response.status === 404){
                this.setState({audioFile: null,
                    audioIcon: "icons8-ios-50.png",
                    setAudioFileTitle: "Set audio file..."
                })
              }
            } else if (error.request) {
                console.log("Entering else if (error.request): "+error.request)
            } else {
              console.log('Error', error.message);
            }
        })
    }
    toggleEditChapterDialog() {
        console.log('Entering toggleEditChapterDialog()');
        this.setState({ showEditChapterDialog: !this.state.showEditChapterDialog})
    }
    submitChapterEdit(){
        console.log('Entering handleEditChapter() editedChapterName: '+this.state.editedChapterName+' currentChapter: '+this.state.chapters[this.state.chapterPointer].ID);

        axios.post('http://localhost:3001/updatechaptername', { newChapterName: this.state.editedChapterName, ChapterID: this.state.chapters[this.state.chapterPointer].ID })
        .then((response) => {
            console.log("chapters: "+JSON.stringify(response.data))
            this.setState({ 
                showEditChapterDialog: false,
                chapterName: this.state.editedChapterName
            })
        }).catch((error) => {
          console.log("Error occurred while persisting new chapter name")
          console.error(error)
        })

    }
    handleOnEditChapterNameChange(e){
        console.log('Entering handleOnEditChapterNameChange() editedChapterName: '+e.target.value);
        this.setState({ editedChapterName: e.target.value})

    }
    toggleNewChapterDialog(){
        console.log('Entering toggleNewChapterDialog()');
        this.setState({ editedChapterName: ""})
        this.setState({ showNewChapterDialog: !this.state.showNewChapterDialog})
    }
    handleOnNewChapterNameChange(e){
        console.log('Entering handleOnNewChapterNameChange() newChapterName: '+e.target.value);
        this.setState({ newChapterName: e.target.value})
    }
    submitNewChapter(){
        console.log('Entering submitNewChapter()');
        var newChapterID = this.state.chapters[this.state.chapters.length-1].ID + 1
        console.log('DEBUG newChapterID: '+ newChapterID);
        console.log('DEBUG newChapterName: '+ this.state.newChapterName);

        axios.post('http://localhost:3001/insertnewchapter', { newChapterName: this.state.newChapterName, newChapterID: newChapterID })
        .then((response) => {
            console.log("chapters: "+JSON.stringify(response.data))
            this.setState(previousState => ({
                chapterName: previousState.newChapterName,
                chapters: [...previousState.chapters, {ID: newChapterID, Name: previousState.newChapterName}],
                newChapterName: "",
                currentChapter: newChapterID,
                sentences: [],
                words: [],
                sentencePointer: 0,
                chapterPointer: previousState.chapters.length
            }))
            // Create and save an empty sentence into the new chapter
            this.createPlaceholderSentence()
            this.handleSaveButton()
        }).catch((error) => {
          console.log("Error occurred while inserting new chapter")
          console.error(error)
        })
        this.setState({ showNewChapterDialog: false })

    }
    createPlaceholderSentence(){
        // A new chapter always needs to have at least an empty sentence in DB to prevent exception when navigating chapters 
        var newSentenceID =1  
        var newSentence = []
         for(var i=0; i<4; i++){
            newSentence.push({Column1: "",
            Column2: "",
            RowPosition: i+1,
            SentenceID: newSentenceID,
            State: 4})     
        }        
        this.setState(previousState => ({
            sentences: [...previousState.sentences, newSentenceID],
            currentSentence: newSentenceID,
            words: newSentence,
            audioUploadObject: null,
            audioFile: null,
            audioChanged: false,
            audioIcon: "icons8-ios-50.png",
            setAudioFileTitle: "Set audio file...",
            saveButtonVariant: "warning"
        }))

    }
    render() {
        return (
        <div className="applicationcontainer">
            <div className="chapternavigatorcolor">           
                <div>
                    <div className="row bigbottommargin">
                        <h2>Chapter</h2>
                        <div className="centeralignbox">
                            <button type="button" onClick={() => this.handleOnChapterChange('previousChapter')} className="btn btn-primary topbottommargins"><img src={ arrow_left } alt="" /></button>
                            <span className="sidemargins"> {(this.state.chapterPointer+1)+" / "+this.state.chapters.length+" - "+this.state.chapterName}</span>
                            <button type="button" onClick={() => this.handleOnChapterChange('nextChapter')} className="btn btn-primary topbottommargins "><img src={ arrow_right } alt="" /></button>
                        </div>
                        <Button type="button" onClick={() => this.toggleEditChapterDialog()}  variant="success" className="btn btn-primary topbottommargins sidemargins ">Edit Chapter</Button>
                        <Button type="button" onClick={() => this.toggleNewChapterDialog()}  variant="dark" className="btn btn-primary topbottommargins ">New Chapter</Button>
                    </div>
                </div>
            </div>
            <div className="sentencenavigatorcolor">
                <div>
                    <div className="row">
                        <h2>Sentence</h2>
                        <div className="centeralignbox">
                            <button type="button" onClick={() => this.handleOnSentenceChange('firstSentence')} className="btn btn-primary topbottommargins "><img src={ beginning } alt="" /></button>
                            <button type="button" onClick={() => this.handleOnSentenceChange('previousSentence')} className="btn btn-primary topbottommargins sidemargins"><img src={ arrow_left } alt="" /></button>
                            <input type="text" value={(this.state.sentencePointer+1)+" / "+this.state.sentences.length} readOnly className="topbottommargins sidemargins counter" id="sentenceID" />
                            <button type="button" onClick={() => this.handleOnSentenceChange('nextSentence')} className="btn btn-primary topbottommargins sidemargins"><img src={ arrow_right } alt="" /></button>
                            <button type="button" onClick={() => this.handleOnSentenceChange('lastSentence')} className="btn btn-primary topbottommargins sidemargins"><img src={ end } alt="" /></button>
                        </div>
                        <Button type="button" onClick={() => this.handleNewSentenceButton()}  variant="dark" className="btn btn-primary topbottommargins sidemargins">Add Sentence</Button>
                    </div>
                </div>
            </div>
            <h3>Edit sentence</h3>
            <form onSubmit={this.handleFormSubmit}>
            <div>
                <table className="table table-striped topbottommargins">
                    <thead>
                    <tr>
                        <th>Row position</th>
                        <th>Original</th>
                        <th>Translation</th>
                        <th>State</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    { this.state.words.map((currentWord, index) =>
                    <tr key={index}>
                        <td><input name="RowPosition" className="counter" defaultValue={currentWord.RowPosition} /></td>
                        <td><input name="OriginalText" className="originaltext" onChange={(e) => this.handleOnWordChange(index, e)} value={currentWord.Column1} /></td>
                        <td><input name="TranslatedText" className="translatedtext" onChange={(e) => this.handleOnWordChange(index, e)} value={currentWord.Column2} /></td>
                        <td><Button name="RemoveButton" onClick={(e) => this.handleRemoveRowButton(index, e) } variant={currentWord.RemoveButtonVariant} >Remove</Button></td>
                    </tr>
                    )}
                    </tbody>
                </table>
            </div>
            </form>
            <div className="row">
                <Button name="AddRow" onClick={() => this.handleAddRowButton()} variant="dark" className="sidemargins" >Add Row</Button>
                <Button name="Save" onClick={() => this.handleSaveButton()} variant={this.state.saveButtonVariant}  className="sidemargins" >Save Sentence</Button>
                <Button name="Discard" onClick={(e) => { if (window.confirm('Discard all unsaved changes?')) this.handleDiscardButton() }} variant="danger"  className="sidemargins" >Discard changes</Button>
            </div>    
            <div className="row paddingtop clickableimage">
                <div className="imageButton" title={ this.state.playButtonTitle } alt="Play audio" onClick={this.handlePlayAudio.bind(this)}><img src={ this.state.audioIcon } alt="Play audio" /></div>
                <input type="file" name="file" id="file" className="inputfile" ref={this.audioUploader}  onChange={(e) => this.handleFileUploader(e)} defaultValue={this.state.audioPath} />
                <label htmlFor="file" className="topbottommargins audio">{this.state.setAudioFileTitle}</label>
                <audio ref={this.audioControl}><source src={ this.state.audioFile} /></audio>
                <Button type="button" onClick={() => this.handleExitButton()}  variant="success" className="btn btn-primary topbottommargins sidemargins rightalignbox">Exit Course</Button>

            </div>
            <Modal show={this.state.showEditChapterDialog}>
                    <Modal.Header closeButton onClick={() => this.toggleEditChapterDialog()}>
                    <Modal.Title>Enter new name for chapter..</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.handleFormSubmit}>
                            <input name="newChapterName" className="originalText" onChange={(e) => this.handleOnEditChapterNameChange(e)} defaultValue={this.state.chapterName} />
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={() => this.toggleEditChapterDialog()}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => this.submitChapterEdit()}>
                        Save Changes
                    </Button>
                    </Modal.Footer>
            </Modal>   
            <Modal show={this.state.showNewChapterDialog}>
                    <Modal.Header closeButton onClick={() => this.toggleNewChapterDialog()}>
                    <Modal.Title>Enter name for new chapter..</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={this.handleFormSubmit}>
                            <input name="newChapterName" className="originalText" onChange={(e) => this.handleOnNewChapterNameChange(e)} defaultValue={this.state.newChapterName} />
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={() => this.toggleNewChapterDialog()}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => this.submitNewChapter()}>
                        Save Changes
                    </Button>
                    </Modal.Footer>
            </Modal>   
        </div>    


        )
    }

}

export default SentenceView;
//export default withRouter(SentenceView);