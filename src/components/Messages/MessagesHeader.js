import React, { Component } from 'react'
import {Header, Segment, Input, Icon} from "semantic-ui-react"

export class MessagesHeader extends Component {
    
    render() {
        const {channelName, numUniqueUsers, handleSearchChange, searchLoading, handleStar, isChannelStarred, isPrivateChannel} = this.props

        return (
            <Segment clearing >
                <Header fluid="true" as='h3' floated="left" style={{marginBottom:0}}>
                <span>
                {channelName}
                {!isPrivateChannel && (<Icon onClick={handleStar} name={isChannelStarred ? 'star':'star outline'}  color={isChannelStarred ? 'yellow':'black'} />)}
                </span>
                    <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                </Header>
                
                <Header floated="right">
                    <Input
                    loading={searchLoading}
                    onChange={handleSearchChange}
                    size="mini"
                    icon="search"
                    name="searchTerm"
                    placeholder="Search Messages"
                    />
                </Header>
            </Segment>
        )
    }
}

export default MessagesHeader
