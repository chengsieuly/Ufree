import React, { Component } from 'react';
import { View, TouchableHighlight, Text, Image, TextInput, ListView, StyleSheet, Alert } from 'react-native';
import {connect} from 'react-redux';
import CandidateItem from '../components/CandidateItem'
import firebase from 'firebase';
import _ from 'lodash';

import Router from '../navigation/Router'
import { addFriend } from '../actions'


class AddFriendsScreen extends Component{
  static route = {
    navigationBar: {
      title: 'Add Friends',
    },
  };

  state = {candidateObject: {}}

  onChangeText(text){
    
  //   await firebase.database().ref('users').orderByChild('profile/name').startAt(value).endAt(`${value}~`).once("value", (snapshot) => {   
  //     //changes state once i get the object
  //     this.setState({...this.state, candidateObject:snapshot.val()})

  // });
    console.log(this.state)
    let candidateList = _.filter(this.state.candidatePopulation, (value, key) => {
      console.log(value.profile.name)
      if (value.profile.name.startsWith(text)){
        return value
      }

    })

    this.setState({...this.state, candidateObject:candidateList})
  }

  componentWillMount() {
    this.createDataSource(this.state)
    firebase.database().ref('users').orderByChild('profile/name').once('value', (snapshot) => {
      this.setState({...this.state, candidatePopulation:snapshot.val()})
    });

  }
  componentWillUpdate(nextProps,nextState) {
    this.createDataSource(nextState)
  }

 

  createDataSource({ candidateObject }) {
    let dataArray = []
    if (candidateObject){
      dataArray = _.map(candidateObject, (value) => {return value.profile});
    }
    console.log('datasouce created', )
    
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.dataSource = ds.cloneWithRows(dataArray);
  }

  onListPress(candidate){
    Alert.alert(
      "Add Friend",
      `Are you sure you want to add ${candidate.name} as a friend?`,
      [
        {text: 'Yes', onPress: () => {
          console.log('you got a new friend')
          this.addFriend(candidate)
        }},
        {text: 'No', onPress: () => console.log('you are cold hearted')}
      ]
    )
  }

  addFriend(candidate) {
    this.props.addFriend(candidate) //send to redux
    
    this.props.navigation.performAction(({tabs, stacks}) => {
      //switch back to home page
      tabs('main').jumpToTab('home');
    });
  }
  renderRow(candidate) {
    
    return <CandidateItem 
    onListPress = {(candidate)=>this.onListPress(candidate)}
    candidate={candidate} 
    />;
  }



  render(){
    return(
      <View style = {styles.outerContainerStyle}>
        <View style={styles.searchContainerStyle}>
          <TextInput 
            placeholder = 'search...'
            autoCorrect={false}
            style={styles.inputStyle}
            onChangeText={(value)=>this.onChangeText(value)}
          />
        </View>
        <ListView
          dataSource={this.dataSource}
          renderRow={(candidate) => this.renderRow(candidate)}
          enableEmptySections={true}
          style = {styles.listViewStyle}
        />

        
      </View>
    )
  }
}

const styles = StyleSheet.create({
    outerContainerStyle: {
      flex: 1,
      backgroundColor: 'lightgrey'
    },
    inputStyle: {
        color: '#000',
        paddingRight: 10,
        paddingLeft: 10,
        fontSize: 25,
        lineHeight: 50,
        flex: 1
    },
    searchContainerStyle:{
      height: 70,
      borderBottomWidth: 1,
      backgroundColor:'whitesmoke',
    },
    listViewStyle: {
      flex:1
    }
    
});

function mapStateToProps({auth}){
  return {token: auth.token}
}
export default connect(mapStateToProps, {addFriend})(AddFriendsScreen);