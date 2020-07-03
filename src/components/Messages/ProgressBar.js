import React from 'react';
import { Progress } from 'semantic-ui-react';

const ProgressBar = ({ uploadState, percentUploaded }) =>
  // prettier-ignore
  // progressbar not working properly
  uploadState && (
        <Progress 
            className='progress__bar'
            percent={percentUploaded}
            progress
            indicating
            size='medium'
            inverted
        />
    );

export default ProgressBar;
