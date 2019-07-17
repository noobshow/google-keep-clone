import React, { useState, useEffect } from "react";
import {
  Form,
  FormGroup,
  FormToolsGroup,
  CloseBtn,
  TitleField,
  NoteField,
  Tool,
  Icon,
  ListContainer,
  ListItem,
  ListItemForm,
  Checkbox,
  ListItemFormInput
} from "./notes-elements";
import "../../images/fontello.css";
import uuid from "uuid";
import TextareaAutosize from "react-autosize-textarea";
import { DragDropContext } from "react-beautiful-dnd";
import { Droppable } from "react-beautiful-dnd";

import { connect } from "react-redux";
import { addNote } from "../../redux/notes";
import ColorPicker from "../ColorPicker/ColorPicker";
import TagWidget from "../TagWidget/TagWidget";

function NotesForm({ addNote, availableTags }) {
  const [isInputOpen, toggleInput] = useState(false);
  const [noteState, setNoteState] = useState({
    title: "",
    checkList: false,
    checkListItems: {},
    note: "",
    pinned: "",
    tags: [],
    bgColor: "transparent"
  });
  const [listItemName, setListItemName] = useState("");
  const handlePinClick = () => {
    setNoteState({ ...noteState, pinned: !noteState.pinned });
  };
  const handleToggleClick = () => {
    if (!noteState.checkList) {
      const newNoteCheckListItems = noteState.note
        .split(/\r?\n/)
        .reduce((newCheckList, nameOfListItem) => {
          if (nameOfListItem.trim() === "") {
            return { ...newCheckList };
          }
          const uid = uuid();
          return {
            ...newCheckList,
            [uid]: {
              listItemName: nameOfListItem,
              uid
            }
          };
        }, {});

      setNoteState({
        ...noteState,
        checkList: !noteState.checkList,
        note: "",
        checkListItems: newNoteCheckListItems
      });
    } else {
      const newNote = Object.values(noteState.checkListItems)
        .map(el => el.listItemName)
        .join("\r\n");
      setNoteState({
        ...noteState,
        checkList: !noteState.checkList,
        note: newNote,
        checkListItems: {}
      });
    }
  };
  const resetNoteState = () => {
    setNoteState({
      title: "",
      checkList: false,
      checkListItems: {},
      note: "",
      pinned: "",
      tags: [],
      bgColor: "transparent"
    });
  };
  const handleCloseClick = () => {
    resetNoteState();
    toggleInput(false);
  };
  const handleChange = e => {
    setNoteState({ ...noteState, [e.target.name]: e.target.value });
  };
  const checkIfTargetIsForm = target => {
    if (!target) return false;
    const className = target.className;
    if (className && className.includes("note-form")) {
      return true;
    }
    return checkIfTargetIsForm(target.parentElement);
  };
  const handleBodyClick = e => {
    const targetIsForm = checkIfTargetIsForm(e.target);
    if (!targetIsForm) {
      toggleInput(false);
    }
  };
  const handleDeleteListItem = e => {
    const newCheckListItems = {};
    const currentCheckListItems = { ...noteState.checkListItems };

    for (let prop in currentCheckListItems) {
      if (prop !== e.target.parentElement.name) {
        newCheckListItems[prop] = { ...currentCheckListItems[prop] };
      }
    }
    setNoteState({
      ...noteState,
      checkListItems: newCheckListItems
    });
  };
  useEffect(() => {
    document.body.addEventListener("click", handleBodyClick);

    if (
      (!isInputOpen && noteState.note.trim() + noteState.title.trim() !== "") ||
      (!isInputOpen && Object.values(noteState.checkListItems).length > 0)
    ) {
      addNote(noteState);
    }
    if (!isInputOpen) {
      resetNoteState();
    }
    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  });

  const handleSubmit = e => {
    const uid = uuid();
    const newNoteState = {
      ...noteState,
      checkListItems: {
        ...noteState.checkListItems,
        [uid]: {
          listItemName: e.target.value,
          uid
        }
      }
    };
    setNoteState(newNoteState);
    setListItemName("");
  };

  return (
    <Form bgColor={noteState.bgColor} className="note-form">
      {isInputOpen ? (
        <FormGroup>
          <TitleField
            name="title"
            value={noteState.title}
            onChange={handleChange}
            onClick={e => toggleInput(true)}
            placeholder="Tytuł"
            type="text"
          />
          {noteState.pinned ? (
            <Tool onClick={handlePinClick}>
              <Icon className="icon-pin" />
            </Tool>
          ) : (
            <Tool onClick={handlePinClick}>
              <Icon className="icon-pin-outline" />
            </Tool>
          )}
        </FormGroup>
      ) : (
        ""
      )}
      <FormGroup>
        {noteState.checkList ? (
          <ListContainer>
            <DragDropContext onDragEnd={() => {}}>
              {Object.values(noteState.checkListItems).map((item, i, arr) => (
                <Droppable droppableId={column.id}>
                  <ListItem key={item.uid}>
                    <span>
                      <Icon className="fas fa-grip-vertical" />
                      <Checkbox type="checkbox" />
                      <ListItemFormInput
                        autoFocus={i === arr.length - 1}
                        value={noteState.checkListItems[item.uid].listItemName}
                        onChange={e => {
                          setNoteState({
                            ...noteState,
                            checkListItems: {
                              ...noteState.checkListItems,
                              [item.uid]: {
                                ...noteState.checkListItems[item.uid],
                                listItemName: e.target.value
                              }
                            }
                          });
                        }}
                        onKeyUp={e => {
                          if (e.key === "Enter") {
                            document
                              .getElementById("listItemFormInput")
                              .focus();
                          }
                        }}
                      />
                    </span>
                    <Tool name={item.uid} onClick={handleDeleteListItem}>
                      <Icon name={item.uid} className="fas fa-times" />
                    </Tool>
                  </ListItem>
                </Droppable>
              ))}
            </DragDropContext>
            <ListItemForm>
              <Icon className="fas fa-plus" />
              <ListItemFormInput
                id="listItemFormInput"
                value={listItemName}
                onChange={handleSubmit}
                autoFocus
                placeholder="Element listy"
              />
            </ListItemForm>
          </ListContainer>
        ) : (
          <TextareaAutosize
            style={{ ...NoteField, resize: "none" }}
            name="note"
            value={noteState.note}
            onChange={handleChange}
            onClick={e => toggleInput(true)}
            placeholder="Utwórz notatkę..."
          />
        )}

        {isInputOpen ? (
          ""
        ) : (
          <Tool
            onClick={() => {
              setNoteState({ ...noteState, checkList: true });
              toggleInput(true);
            }}
          >
            <Icon className="far fa-check-square fa-lg" />
          </Tool>
        )}
      </FormGroup>
      <div>
        <ul style={{ display: "flex", listStyle: "none", flexWrap: "wrap" }}>
          {noteState.tags.map(tag => (
            <li
              style={{
                color: "#666",
                background: "rgb(240,240,240)",
                borderRadius: "20px",
                padding: "3px 7px",
                margin: "5px 2px"
              }}
              key={tag}
            >
              {tag}
              <span
                style={{ marginLeft: "2px", cursor: "pointer" }}
                onClick={() => {
                  const newTags = noteState.tags.filter(el => el !== tag);
                  setNoteState({ ...noteState, tags: newTags });
                }}
              >
                &times;
              </span>
            </li>
          ))}
        </ul>
      </div>
      {isInputOpen ? (
        <FormToolsGroup>
          {noteState.checkList ? (
            <Tool onClick={handleToggleClick}>
              <Icon className="far fa-clipboard" />
            </Tool>
          ) : (
            <Tool onClick={handleToggleClick}>
              <Icon className="fas fa-list-ul" />
            </Tool>
          )}

          <Tool className="fas fa-list-ul" onClick={() => console.log(123)} />
          <TagWidget
            fetchedTags={availableTags}
            chosenTagsForNote={noteState.tags}
            setNewTagsForNote={tags => setNoteState({ ...noteState, tags })}
          />
          <ColorPicker
            chosenColor={noteState.bgColor}
            setColor={bgColor => setNoteState({ ...noteState, bgColor })}
          />
          <CloseBtn onClick={handleCloseClick}>Zamknij</CloseBtn>
        </FormToolsGroup>
      ) : (
        ""
      )}
    </Form>
  );
}

const mapStateToProps = state => {
  return {
    availableTags: state.notes.tags
  };
};

const mapDispatchToProps = {
  addNote
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotesForm);
