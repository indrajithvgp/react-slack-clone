import React, { Component } from 'react'
import {Menu, Icon} from 'semantic-ui-react'

export class DirectMessages extends Component {
    render() {
        const {users} = this.props
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail"/>DIRECT MESSAGES
                    </span>{''}
                    (0)
                </Menu.Item>
            </Menu.Menu>
        )
    }
}

export default DirectMessages
