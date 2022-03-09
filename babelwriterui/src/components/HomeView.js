import React, { Component } from 'react';
import '../App.css';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import { withRouter } from 'react-router';



class HomeView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            courseList: [],
            openButtonVariant: "warning"

        }
        this.courseSelector = React.createRef()
    }
    componentDidMount = async () => {
        this.handleGetCourseList()

    }
    handleGetCourseList(e){
        console.log("entering getCourseList ")
        axios.get('http://localhost:3001/courselist/')
        .then((response) => {
            const statefulData = response.data
            this.setState((previousState) => ({
                courseList: statefulData
            }))
            console.log(statefulData)            
        }).catch((error) => {
            console.log("Error occurred while fetching Course list")
            console.error(error)
          }) 
    }
    handleOpenButton(selectedCourse){
        console.log(selectedCourse)
        axios.get('http://localhost:3001/setdb/'+selectedCourse)
        .then(res => {
            this.props.history.push('/course_editor')
        })
    }
    render() {
        return(
            <div>
                <div></div>
                <div style={{ margin: 25, padding: 10 }}><h1>Select course file..</h1></div>
                <div style={{ margin: 20, padding: 10 }}>
                    <table>
                        <tbody>
                        { this.state.courseList.map((currentCourse, index) =>
                        <tr key={index}>
                            <td><Button name="OpenButton" onClick={(e) => this.handleOpenButton(currentCourse) } variant="warning" >{currentCourse}</Button></td>
                        </tr>
                        )}
                        </tbody>
                    </table>

                </div>
            </div>
        )
    }
}

export default withRouter(HomeView);