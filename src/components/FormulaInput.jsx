import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Chip, TextField, Autocomplete, Paper, CircularProgress, Typography } from '@mui/material';
import useFormulaStore from '../store/formulaStore.js';
import { getSuggestions } from '../services/api.js';

// Dummy variables for calculation
const variables = {
  x: 10,
  y: 5,
  z: 3,
};

const isOperator = (char) => ['+', '-', '*', '/', '^', '(', ')'].includes(char);

// Tag validation
const validateTag = (tag) => {
  if (!tag || typeof tag !== 'object') return false;
  if (!tag.value || typeof tag.value !== 'string') return false;
  if (!tag.type || !['operator', 'variable'].includes(tag.type)) return false;
  return true;
};

const FormulaInput = () => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [undoStack, setUndoStack] = useState({
    items: [], // Array of deleted tags
    pointer: -1, // Points to the current position in undo history
  });
  const { tags, addTag, removeTag, updateTag, result, setResult, clearTags } = useFormulaStore();
  const inputRef = useRef(null);
  const MAX_UNDO_HISTORY = 10;

  // Enhanced React Query for autocomplete
  const { 
    data: autocompleteSuggestions,
    isLoading,
    isError,
    error: queryError
  } = useQuery({
    queryKey: ['suggestions', inputValue],
    queryFn: () => getSuggestions(inputValue),
    enabled: inputValue.length > 0 && !isOperator(inputValue),
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (autocompleteSuggestions) {
      const formattedSuggestions = Array.isArray(autocompleteSuggestions) 
        ? autocompleteSuggestions.map(suggestion => 
            typeof suggestion === 'string' ? suggestion : suggestion.value || ''
          )
        : [];
      setSuggestions(formattedSuggestions);
    }
  }, [autocompleteSuggestions]);

  const calculateResult = (tags) => {
    try {
      if (!tags || tags.length === 0) {
        setResult(0);
        return;
      }

      // Validate all tags before calculation
      if (!tags.every(validateTag)) {
        setError('Invalid tag format detected');
        setResult('Error');
        return;
      }

      const expression = tags.map(tag => {
        if (isOperator(tag.value)) return tag.value;
        return variables[tag.value] || tag.value;
      }).join(' ');

      if (!expression.trim()) {
        setResult(0);
        return;
      }

      const result = Function(`return ${expression}`)();
      
      if (result === undefined || result === null || Number.isNaN(result)) {
        setError('Invalid calculation result');
        setResult('Error');
      } else {
        setError('');
        setResult(result);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      setError('Calculation error occurred');
      setResult('Error');
    }
  };

  const handleInputChange = (event, newValue) => {
    setInputValue(newValue || '');
    setError(''); // Clear any previous errors

    if (isOperator(newValue)) {
      const newTag = { value: newValue, type: 'operator' };
      if (validateTag(newTag)) {
        addTag(newTag);
        setInputValue('');
        calculateResult([...tags, newTag]);
      }
    }
  };

  const handleTagSelect = (value) => {
    if (!value) return;
    setError(''); // Clear any previous errors
    
    const tagValue = typeof value === 'string' ? value : value.value || '';
    const newTag = { value: tagValue, type: 'variable' };
    
    if (validateTag(newTag)) {
      addTag(newTag);
      setInputValue('');
      calculateResult([...tags, newTag]);
    }
  };

  const handleDelete = (indexToDelete) => {
    if (indexToDelete < 0 || indexToDelete >= tags.length) return;
    setError('');
    
    const tagToDelete = tags[indexToDelete];
    
    // Add to undo stack
    setUndoStack(prev => {
      const newItems = [...prev.items, { 
        tag: tagToDelete, 
        index: indexToDelete,
        timestamp: Date.now() 
      }].slice(-MAX_UNDO_HISTORY); // Keep only the last MAX_UNDO_HISTORY items
      
      return {
        items: newItems,
        pointer: newItems.length - 1
      };
    });
    
    const newTags = tags.filter((_, index) => index !== indexToDelete);
    removeTag(indexToDelete);
    
    if (newTags.length === 0) {
      setResult(0);
    } else {
      calculateResult(newTags);
    }
  };

  const handleUndo = () => {
    setUndoStack(prev => {
      if (prev.items.length === 0 || prev.pointer < 0) return prev;
      
      const itemToRestore = prev.items[prev.pointer];
      const { tag, index } = itemToRestore;
      
      // Insert the tag back at its original position or at the end if position is invalid
      const insertIndex = Math.min(index, tags.length);
      const newTags = [
        ...tags.slice(0, insertIndex),
        tag,
        ...tags.slice(insertIndex)
      ];
      
      // Add the tag and recalculate
      addTag(tag);
      calculateResult(newTags);
      
      // Update undo stack
      return {
        items: prev.items,
        pointer: prev.pointer - 1
      };
    });
  };

  const handleKeyDown = (event) => {
    // Handle backspace for tag deletion
    if (event.key === 'Backspace') {
      if (inputValue === '' && tags.length > 0) {
        event.preventDefault();
        handleDelete(tags.length - 1);
      }
    }
    // Handle Ctrl/Cmd + Z for undo last deletion
    else if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault();
      handleUndo();
    }
  };

  // Clear undo stack when adding new tags (not from undo)
  useEffect(() => {
    const currentTagCount = tags.length;
    
    // If we've added a new tag manually (not from undo), clear the undo stack
    if (currentTagCount > 0 && undoStack.items.length > 0) {
      const lastTag = tags[currentTagCount - 1];
      const wasFromUndo = undoStack.items.some(item => 
        item.tag.value === lastTag.value && 
        item.tag.type === lastTag.type
      );
      
      if (!wasFromUndo) {
        setUndoStack({ items: [], pointer: -1 });
      }
    }
  }, [tags]);

  // Add keyboard event listener for global undo
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [tags, undoStack]); // Dependencies for the effect

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: '0 auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            opacity: tags.length > 0 ? 1 : 0.5 
          }}>
            <span>Press Backspace when input is empty to delete last tag</span>
            {undoStack.pointer >= 0 && (
              <>
                <span>•</span>
                <span style={{ color: '#1976d2' }}>
                  Ctrl/Cmd + Z to undo deletion ({undoStack.pointer + 1} of {undoStack.items.length})
                </span>
              </>
            )}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag.value}
                onDelete={() => handleDelete(index)}
                color={tag.type === 'operator' ? 'secondary' : 'primary'}
                variant="filled"
                size="medium"
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            ))}
            <Autocomplete
              freeSolo
              options={suggestions}
              inputValue={inputValue}
              onInputChange={handleInputChange}
              onChange={(_, newValue) => {
                handleTagSelect(newValue);
              }}
              getOptionLabel={(option) => {
                return typeof option === 'string' ? option : option.value || '';
              }}
              renderOption={(props, option) => (
                <li {...props}>
                  {typeof option === 'string' ? option : option.value || ''}
                </li>
              )}
              filterOptions={(options, params) => {
                const filtered = options.filter(option => {
                  const value = typeof option === 'string' ? option : option.value || '';
                  return value.toLowerCase().includes(params.inputValue.toLowerCase());
                });
                return filtered;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  placeholder={tags.length > 0 ? "Continue formula..." : "Start typing or enter an operator..."}
                  onKeyDown={handleKeyDown}
                  sx={{ minWidth: 100 }}
                  ref={inputRef}
                  error={isError || !!error}
                  helperText={error || (isError ? 'Error fetching suggestions' : '')}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading && <CircularProgress color="inherit" size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              loading={isLoading}
              sx={{ flexGrow: 1 }}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Result"
              value={result}
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default FormulaInput;