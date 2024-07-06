import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import Quiz from './components/Quiz';

const App = () => {

  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <FileUpload/>
        </Route>
        <Route path="/quiz">
          <Quiz pdfText={pdfText} />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;