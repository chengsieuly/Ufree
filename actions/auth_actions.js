import { AsyncStorage } from 'react-native';
import { Facebook } from 'expo';
import {
  FACEBOOK_LOGIN_SUCCESS,
  FACEBOOK_LOGIN_FAIL,
  FACEBOOK_FETCH_DATA,
  FETCH_FRIENDS,
  ADD_FRIEND,
  FACEBOOK_LOGOUT,
  DEL_FRIEND, 
  UPDATE_AVAIL
} from './types';

import firebase from 'firebase';
import _ from 'lodash';


//AsyncStorage.setItem('fb_token', token);
//AsyncStorage.getItem('fb_token');

export const facebookLogin = () => async dispatch => {
  console.log('asyncstorage is ', AsyncStorage)
  let token = await AsyncStorage.getItem('fb_token');
  let profile = JSON.parse(await AsyncStorage.getItem('fb_profile')) 

  // ///REMOVE THIS!!
  // token = null
  // profile = null
  if (token && profile) {
    // dispatch an action to say FB login is done
    dispatch({type: FACEBOOK_LOGIN_SUCCESS, payload: {token, profile}});
  } else {
    // start up fb login process
    doFacebookLogin(dispatch);
  }

}; 

const doFacebookLogin = async dispatch => {
  let {type, token} = await Facebook.logInWithReadPermissionsAsync('864048573736511', {
    permissions: ['public_profile']
  });

  if (type === 'cancel') {
    return dispatch({ type: FACEBOOK_LOGIN_FAIL });
  }
  //grabbing token
  await AsyncStorage.setItem('fb_token', token);
  const result = await fetch(
    `https://graph.facebook.com/me/?access_token=${token}`
  );
  const profile = await result.json();
  await AsyncStorage.setItem('fb_profile', JSON.stringify(profile));
  authenticate(token)

  dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: {token,profile} });


  
};
const authenticate = (token) => {
  const provider = firebase.auth.FacebookAuthProvider
  const credential = provider.credential(token)
  //check to see how i can signin without deleting my user!!!
  firebase.auth().signInWithCredential(credential)

}

export const facebookFetchData = () => {
//uses redux thunk, passes in dispatch and store to get the redux store
  return (dispatch, store) => {
    const id = store().auth.profile.id //grabs users id from the Redux store
    let ref = firebase.database().ref(`/users/${id}`).on("value", function(snapshot) { //grabs data in firebase
    console.log('fetching facebook')
    dispatch( { type: FACEBOOK_FETCH_DATA, payload: snapshot.val() });
  
  });
 }
};

export const addFriend = (newFriend) => {
  return (dispatch, getState) => {
    console.log('adding friend in actions', newFriend)
    let state = getState()
    firebase.database().ref(`users/${state.auth.profile.id}/friends/${newFriend.id}`).update({'isFriend':true});
    dispatch( {type: ADD_FRIEND, payload: newFriend })
  }
}

export const deleteFriend = (badFriend) => {
  return (dispatch) => {
    //do i even need to redux?
    //let state = getState()
    dispatch( {type: DEL_FRIEND, payload: badFriend })

  }
}

export const facebookLogout = () => async (dispatch) => {
  
  await AsyncStorage.removeItem('fb_token').catch();
  await AsyncStorage.removeItem('fb_profile').catch();

  dispatch ({ type: FACEBOOK_LOGOUT, payload: null});
  
}

export const updateAvailability = (availability) => {
  
  return (dispatch,getState) => {
    let state=getState();
    console.log('state in update avail', state)
    firebase.database().ref(`users/${state.auth.profile.id}`).update({'available':availability}).catch()

    dispatch( {type: UPDATE_AVAIL, payload: availability})
  }
}

export const fetchFriends = () => {

  return(dispatch, store) => {
    const id = store().auth.profile.id
    firebase.database().ref(`/users/${id}/friends`).on('value', function(snapshot){
      console.log('fetch friends array',snapshot.val())
      //dispatch({type: FETCH_FRIENDS, payload:snapshot.val() });
       _.forEach(snapshot.val(),(val, key)=>{
        //console.log('inside map', key)
        //key is the friends id

          firebase.database().ref(`/users/${key}`).on('value', function(snapshot){
            console.log('inside the friend array', snapshot.val())
            if(snapshot.val()){
              //only dispatch if snapshot.val is not null (won't show any bad friends)
              //console.log('firebase found data', snapshot.val())
              dispatch({type:FETCH_FRIENDS, payload: snapshot.val()})
            }
          });

       });
    });
  }
}
                