# Recruitment Task - Lucid Financials

## Task Overview
The goal of this task is to implement a formula input functionality similar to what is seen in Causal.app. Below, you’ll find all the details regarding the requirements, features, and the submission process.

## Requirements

I had 5 hours to complete the task. This task involved building a formula input system with the following key features:

### Key Features:
- **Formula Input UI**: Implement the formula input functionality, where users can type variables, operands, and apply basic arithmetic operations (+, -, *, /, ^, ()).
- **Autocomplete Suggestions**: Fetch autocomplete suggestions dynamically after typing, even after an operator is entered.
- **Support for Operand Handling**: Handle operands like `+`, `-`, `*`, `/`, and `^` between variables and numbers.
- **Tag Deletion**: Implement a system that allows users to delete tags with the backspace key.
- **Dropdown for Each Tag**: Add a dropdown for each tag allowing interactions (as seen in Causal).
- **Calculating Results**: Provide basic functionality to compute the result using dummy variables (`x = 10`, `y = 5`, `z = 3`). **Bonus**: Implement result calculation based on the formula input.

### Mandatory:
- **State Management**: Use **Zustand** for managing the local state of the tags and **React Query** for handling API state (autocomplete suggestions).
- **UI**: Though functionality is the priority, ensure that the design is neat and functional.

## How I completed the task

1. **Familiarize Yourself with Causal**: 
   - Visit [Causal App](https://www.causal.app) and sign up for a free trial.
   - Opened the formula input to understand how it works.
   - Refered to the video to understand the entire functionality of the formula input.

2. **Understand the Requirements**:
   - Studied the video and the UI design of Causal’s formula input.
   - Ensured I understand how the formula input behaves and the features it supports.

3. **Libraries**:
   - Specifically, I used **React Query** for API state management and **Zustand** for managing the tags and formula state.

4. **Handling State**:
   - **Zustand** will is used to manage the state of tags.
   - **React Query** is responsible for managing API calls for fetching autocomplete suggestions.


