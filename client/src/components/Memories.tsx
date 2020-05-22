import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import {
  createMemory,
  deleteMemory,
  getMemories,
  patchMemory
} from '../api/memories-api'
import Auth from '../auth/Auth'
import { Memory } from '../types/Memory'

interface MemoriesProps {
  auth: Auth
  history: History
}

interface MemoriesState {
  memories: Memory[]
  newMemoryName: string
  loadingMemories: boolean
}

export class Memories extends React.PureComponent<
  MemoriesProps,
  MemoriesState
> {
  state: MemoriesState = {
    memories: [],
    newMemoryName: '',
    loadingMemories: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newMemoryName: event.target.value })
  }

  onEditButtonClick = (memoryId: string) => {
    console.log(`Memory ID @ Memories.tsx ${memoryId}`)
    this.props.history.push(`/memories/${memoryId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const memoryDate = this.calculateMemoryDate()
      const newMemory = await createMemory(this.props.auth.getIdToken(), {
        name: this.state.newMemoryName,
        memoryDate
      })
      this.setState({
        memories: [...this.state.memories, newMemory],
        newMemoryName: ''
      })
    } catch {
      alert('Memory creation failed')
    }
  }

  onTodoDelete = async (memoryId: string) => {
    try {
      await deleteMemory(this.props.auth.getIdToken(), memoryId)
      this.setState({
        memories: this.state.memories.filter(
          (memory) => memory.memoryId != memoryId
        )
      })
    } catch {
      alert('Memory deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const memory = this.state.memories[pos]
      await patchMemory(this.props.auth.getIdToken(), memory.memoryId, {
        name: memory.name,
        memoryDate: memory.memoryDate,
        favorite: !memory.favorite
      })
      this.setState({
        memories: update(this.state.memories, {
          [pos]: { favorite: { $set: !memory.favorite } }
        })
      })
    } catch {
      alert('Memory update failed')
    }
  }

  async componentDidMount() {
    try {
      const memories = await getMemories(this.props.auth.getIdToken())
      this.setState({
        memories,
        loadingMemories: false
      })
    } catch (e) {
      alert(`Failed to fetch memories: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Memories</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New memory',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Visit to DisneyLand..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingMemories) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Memories
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.memories.map((memory, pos) => {
          return (
            <Grid.Row key={memory.memoryId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={memory.favorite}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {memory.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {memory.memoryDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(memory.memoryId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(memory.memoryId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {memory.attachmentUrl && (
                <Image src={memory.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateMemoryDate(): string {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 1000) + 1)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
