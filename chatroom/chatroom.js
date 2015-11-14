// we'll use a local collection to store incoming data
Chats = new Mongo.Collection(null);
//Chats = new Mongo.Collection('chats');

if (Meteor.isClient) {
  /* Wire up Phoenix on startup */
  const {Socket} = PhoenixRuntime;
  const socket = new Socket("ws://localhost:4000/socket")

  // TODO add authentication with Meteor `_loginToken`
  socket.connect(/* {token: window.userToken} */)

  // join the rooms channel with a topic of 'lobby' (public)
  const channel = socket.channel("rooms:lobby", {})

  channel.join()
  .receive("ok",    resp => console.log("Joined successfully", resp))
  .receive("error", resp => console.log("Unable to join",      resp))

  channel.on("new_msg", data => {
    // insert in our local minimongo cache
    Chats.insert({username: data.username, message: data.message});
  })
  /* End Phoenix wiring */


  Template.chats.helpers({
    chatData: function() {
      return Chats.find({}, {sort: {time: 1}});
    }
  });

  Template.inputBar.events({
    'submit': function (e) {
      e.preventDefault();
      let username = $('input:eq(0)').val();
      let message = $('input:eq(1)').val();

      channel.push('new_msg',{username, message, time: Date.now()})
      // old method - Chats.insert({username, message, time: Date.now()})

      message = $('input:eq(1)').val(''); // reset form send
      $("ul").scrollTop($("ul").scrollTop() + 100);
    }
  });

  Template.chat.onRendered(function() {
    // scroll down on render
    var myDiv = $("ul");
    myDiv.animate({ scrollTop: myDiv.prop("scrollHeight") - myDiv.height() }, 0);
  })
}
// END isClient





if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
