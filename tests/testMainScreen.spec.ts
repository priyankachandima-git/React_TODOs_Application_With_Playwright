import * as fs from 'fs';
import { test, expect } from '../support/fixtures';
import { MainScreen } from '../testBase/testBase';
import { read } from '../support/read-xlsx';
import {
  I_AddTodoItems,
  I_RemoveTodoItemByTitle,
  I_MarkItemAsCompletedByTitle,
  I_ValidateItemIsCompletedByTitle,
  I_ValidateAllCompletedItemsGetFiltered_By_CompletedFilterOption,
  I_ValidateAllItemIsCompleted,
  I_ValidateNumberOfActiveItemMessage,
  I_ValidateTodoItemDoesNotExistByTitle,
} from '../helpers/mainScreenHelper';
import todosFrontPages from '../pageObjects/todosFrontPages.json';
import mainScreenData from '../fixtures/mainScreen.json';

test.describe('Test Plan of TODOS Application', () => {
  // Regenerate the test-data fixture from the Excel source — the Playwright
  // equivalent of the original Cypress `before()` + `cy.task('readXlsx')`.
  test.beforeAll(() => {
    const todoItems = read({
      file: 'fixtures/mainScreenData.xlsx',
      sheet: 'MainScreen',
    });
    fs.writeFileSync(
      'fixtures/mainScreen.json',
      JSON.stringify({ todoItems }, null, 2),
    );
  });

  test.describe('Test suite of TODOS application main screen', () => {
    test('As a user I should be able to access TODOS application', async ({ I }) => {
      await I.Open(MainScreen);
      await I.AmOn(MainScreen);
    });

    test('As a user I should be able to see the input filed to add new TODO item', async ({ I }) => {
      await I.Open(MainScreen);
      await I.See(todosFrontPages.MainScreen.AddNewTodoInput);
    });

    test('As a user I should be able to see a readable place holder message on add item input field', async ({ I }) => {
      await I.Open(MainScreen);
      await I.SeeAttributeValue(
        todosFrontPages.MainScreen.AddNewTodoInput,
        'placeholder',
        'What needs to be done?',
      );
    });

    test('As a user I should be able to add a new TODO item', async ({ I }) => {
      await I.Open(MainScreen);
      await I_AddTodoItems(I, mainScreenData.todoItems, 3);
      await I.See(todosFrontPages.MainScreen.TodoList);
      await I_ValidateNumberOfActiveItemMessage(I, 3);
    });

    test('As a user I should have a option to delete a particular item on TODO list', async ({ I }) => {
      await I.Open(MainScreen);
      await I_AddTodoItems(I, mainScreenData.todoItems, 3);
      await I_RemoveTodoItemByTitle(I, mainScreenData.todoItems[0].TodoItemTitle);
      await I_ValidateTodoItemDoesNotExistByTitle(
        I,
        mainScreenData.todoItems[0].TodoItemTitle,
      );
      await I_ValidateNumberOfActiveItemMessage(I, 2);
    });

    test('As a user I should have an option to mark a particular item as completed', async ({ I }) => {
      await I.Open(MainScreen);
      await I_AddTodoItems(I, mainScreenData.todoItems, 3);
      await I_MarkItemAsCompletedByTitle(I, mainScreenData.todoItems[0].TodoItemTitle);
      await I_ValidateItemIsCompletedByTitle(I, mainScreenData.todoItems[0].TodoItemTitle);
    });

    test('As a user I should be able to mark all active items as completed in one click', async ({ I }) => {
      await I.Open(MainScreen);
      await I_AddTodoItems(I, mainScreenData.todoItems, 3);
      await I.Click(todosFrontPages.MainScreen.CompleteAll);
      await I_ValidateAllItemIsCompleted(I);
    });

    test('As a user I should be able to clear all the completed item(s) in one click', async ({ I }) => {
      await I.Open(MainScreen);
      await I_AddTodoItems(I, mainScreenData.todoItems, 3);
      await I.Click(todosFrontPages.MainScreen.CompleteAll);
      await I_ValidateAllItemIsCompleted(I);
      await I.Click(todosFrontPages.MainScreen.ClearAllCompleted);
      await I.DontSee(todosFrontPages.MainScreen.TodoList);
      await I.DontSee(todosFrontPages.MainScreen.ClearAllCompleted);
    });

    test('As a user I should be able to filter all the completed items', async ({ I }) => {
      await I.Open(MainScreen);
      await I_AddTodoItems(I, mainScreenData.todoItems, 6);
      await I_MarkItemAsCompletedByTitle(I, mainScreenData.todoItems[0].TodoItemTitle);
      await I_MarkItemAsCompletedByTitle(I, mainScreenData.todoItems[1].TodoItemTitle);
      await I.Click(todosFrontPages.MainScreen.FilterByCompletedItem);
      await I_ValidateAllCompletedItemsGetFiltered_By_CompletedFilterOption(I, 2);
    });
  });
});
