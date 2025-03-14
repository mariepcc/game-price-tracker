import React, { useState } from 'react';
import { ListGroup } from 'react-bootstrap';

function SearchTextList({searchTexts, onSearchTextClick, onRemoveTextClick}) {
 
  return (
    <div>
      <h2>All Games</h2>
      <ListGroup variant="flush">
        {searchTexts.map((searchText, index) => (
          <ListGroup.Item key={index} onClick={() => onSearchTextClick(searchText)}>
            <button>{searchText}</button>
            <button 
              onClick={() => { 
                onRemoveTextClick(searchText);
              }}
            >
              Remove
            </button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default SearchTextList;
