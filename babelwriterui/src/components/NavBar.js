import React, { Component } from 'react';
import babelicon from  '../assets/babelicon.png';
//import { Button } from 'react-bootstrap';
//import { Nav } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';

class NavBar extends Component {

    render() {
        return (
        <div>
            <Navbar bg="dark">
                <Nav>
                    <ul className="navbar-nav">
                        <div className="navbar-brand navmargins">
                            <img src={babelicon} alt="Logo" style={{ width: 40 }} />
                        </div>
                        <Link to={`/`}>
                            <h1 className="droidgrey">Babelwriter</h1>
                        </Link>

                    </ul>
                </Nav>
            </Navbar>
        </div>    
        )
    }
}

export default NavBar;
