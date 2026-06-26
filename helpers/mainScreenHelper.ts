import { expect } from '@playwright/test';
import { Actor } from '../testBase/testBase';
import todosFrontPages from '../pageObjects/todosFrontPages.json';

export interface TodoItem {
  TodoItemTitle: string;
}

/**
 * @param I the actor (bound to the active page)
 * @param itemList list of TODO items
 * @param numberOfItemsNeeded how many items to pick from the given item list
 * @summary Insert the given number of TODO items.
 */
export async function I_AddTodoItems(
  I: Actor,
  itemList: TodoItem[],
  numberOfItemsNeeded: number,
): Promise<void> {
  for (let i = 0; i < numberOfItemsNeeded; i++) {
    await I.FillAndPressEnter(
      todosFrontPages.MainScreen.AddNewTodoInput,
      itemList[i].TodoItemTitle,
    );
  }
}

/**
 * @param I the actor
 * @param todoItemTitle title of the given TODO item
 * @summary Get the index of the given TODO item within the item list.
 */
export async function GetIndexByItemTitle(
  I: Actor,
  todoItemTitle: string,
): Promise<number> {
  const labels = I.loc(todosFrontPages.MainScreen.TodoItemLabel);
  const count = await labels.count();
  let indexOfItem = -1;
  for (let index = 0; index < count; index++) {
    const text = (await labels.nth(index).innerText()).toString();
    if (text === todoItemTitle) {
      indexOfItem = index;
    }
  }
  return indexOfItem;
}

/**
 * @param I the actor
 * @param todoItemTitle title of the given TODO item
 * @summary Remove the given TODO item from the list.
 */
export async function I_RemoveTodoItemByTitle(
  I: Actor,
  todoItemTitle: string,
): Promise<void> {
  const indexOfItem = await GetIndexByItemTitle(I, todoItemTitle);
  // The destroy (X) button is hidden until its row is hovered, so reveal it first.
  await I.loc(todosFrontPages.MainScreen.TodoItems).nth(indexOfItem).hover();
  await I.loc(todosFrontPages.MainScreen.DeleteItem)
    .nth(indexOfItem)
    .click({ force: true });
}

/**
 * @param I the actor
 * @param todoItemTitle title of the given TODO item
 * @summary Mark the given TODO item as completed.
 */
export async function I_MarkItemAsCompletedByTitle(
  I: Actor,
  todoItemTitle: string,
): Promise<void> {
  const indexOfItem = await GetIndexByItemTitle(I, todoItemTitle);
  await I.loc(todosFrontPages.MainScreen.SelectItems)
    .nth(indexOfItem)
    .click({ force: true });
}

/**
 * @param I the actor
 * @param todoItemTitle title of the given TODO item
 * @summary Verify the given TODO item is completed.
 */
export async function I_ValidateItemIsCompletedByTitle(
  I: Actor,
  todoItemTitle: string,
): Promise<void> {
  const indexOfItem = await GetIndexByItemTitle(I, todoItemTitle);
  await expect(
    I.loc(todosFrontPages.MainScreen.TodoItems).nth(indexOfItem),
  ).toHaveClass(/completed/);
}

/**
 * @param I the actor
 * @param completedItemsCount number of completed TODO items
 * @summary Verify the 'Completed' filter lists all completed TODO items.
 */
export async function I_ValidateAllCompletedItemsGetFiltered_By_CompletedFilterOption(
  I: Actor,
  completedItemsCount: number,
): Promise<void> {
  const items = I.loc(todosFrontPages.MainScreen.TodoItems);
  await expect(items).toHaveCount(completedItemsCount);
  const count = await items.count();
  for (let index = 0; index < count; index++) {
    await expect(items.nth(index)).toHaveClass(/completed/);
  }
}

/**
 * @param I the actor
 * @summary Verify all items are completed.
 */
export async function I_ValidateAllItemIsCompleted(I: Actor): Promise<void> {
  const items = I.loc(todosFrontPages.MainScreen.TodoItems);
  const count = await items.count();
  for (let index = 0; index < count; index++) {
    await expect(items.nth(index)).toHaveClass(/completed/);
  }
}

/**
 * @param I the actor
 * @param numberOfActiveItems expected active item count
 * @summary Verify the label that shows the number of items in active mode.
 */
export async function I_ValidateNumberOfActiveItemMessage(
  I: Actor,
  numberOfActiveItems: number,
): Promise<void> {
  await expect(
    I.loc(todosFrontPages.MainScreen.NumberOfItemsLeft),
  ).toContainText(String(numberOfActiveItems));
}

/**
 * @param I the actor
 * @param todoItemTitle title of the given TODO item
 * @summary Verify the given TODO item does not exist in the list.
 */
export async function I_ValidateTodoItemDoesNotExistByTitle(
  I: Actor,
  todoItemTitle: string,
): Promise<void> {
  const labels = I.loc(todosFrontPages.MainScreen.TodoItemLabel);
  const count = await labels.count();
  for (let index = 0; index < count; index++) {
    const text = (await labels.nth(index).innerText()).toString();
    expect(text, `Todo item ${todoItemTitle} not deleted`).not.toEqual(
      todoItemTitle,
    );
  }
}

/**
 * @param I the actor
 * @param oldTitle current title of the TODO item to edit
 * @param newTitle new title to set
 * @summary Edit a TODO item's title by double-clicking its label, replacing the
 *          text and confirming with Enter.
 */
export async function I_EditTodoItemByTitle(
  I: Actor,
  oldTitle: string,
  newTitle: string,
): Promise<void> {
  const indexOfItem = await GetIndexByItemTitle(I, oldTitle);
  // Double-clicking the label puts the row into edit mode and reveals the
  // single `.edit` input (pre-filled with the current title).
  await I.loc(todosFrontPages.MainScreen.TodoItemLabel)
    .nth(indexOfItem)
    .dblclick();
  await I.FillAndPressEnter(todosFrontPages.MainScreen.EditTodoInput, newTitle);
}

/**
 * @param I the actor
 * @param todoItemTitle title expected to be present in the list
 * @summary Verify a TODO item with the given title exists in the list.
 */
export async function I_ValidateTodoItemExistsByTitle(
  I: Actor,
  todoItemTitle: string,
): Promise<void> {
  await expect(
    I.loc(todosFrontPages.MainScreen.TodoItemLabel).filter({
      hasText: todoItemTitle,
    }),
  ).toHaveCount(1);
}
