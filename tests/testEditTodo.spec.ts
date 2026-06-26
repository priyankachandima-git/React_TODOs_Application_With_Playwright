import { test } from '../support/fixtures';
import { MainScreen } from '../testBase/testBase';
import {
  I_AddTodoItems,
  I_EditTodoItemByTitle,
  I_ValidateTodoItemExistsByTitle,
  I_ValidateTodoItemDoesNotExistByTitle,
  I_ValidateNumberOfActiveItemMessage,
} from '../helpers/mainScreenHelper';
import mainScreenData from '../fixtures/mainScreen.json';

test.describe('Test Plan of TODOS Application', () => {
  test.describe('Test suite of editing a TODO item', () => {
    test('As a user I should be able to edit a TODO item by double-clicking it', async ({ I }) => {
      const oldTitle = mainScreenData.todoItems[1].TodoItemTitle;
      const newTitle = `${oldTitle} EDITED`;

      await I.Open(MainScreen);
      await I_AddTodoItems(I, mainScreenData.todoItems, 3);

      await I_EditTodoItemByTitle(I, oldTitle, newTitle);

      await I_ValidateTodoItemExistsByTitle(I, newTitle);
      await I_ValidateTodoItemDoesNotExistByTitle(I, oldTitle);
      // Editing the title must not change the number of items.
      await I_ValidateNumberOfActiveItemMessage(I, 3);
    });
  });
});
