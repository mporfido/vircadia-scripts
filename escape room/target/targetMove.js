(function () {

	var myID;
	
	var resetChannel = "reset.escape.room"
	var resetProperties = ["position"]

	// displacement: the vector indicating the displacement
	// singleUse: whether the displacement should be performed only once (true) or reverted at next call
	// displaced: false if the object is in default position
	var defaultActionData = {
		displacement: {x: 0, y: 1, z: 0},
		singleUse: false,
		displaced: false
	}

	this.performAction = function() {
		position = Entities.getEntityProperties(myID, ["position"]).position;
		actionData = getUserData(myID, "action");

		if (actionData.singleUse) {
			if (!actionData.displaced) {
				position = Vec3.sum(position, actionData.displacement);
				actionData.displaced = true;
			}
		} else {
			if (actionData.displaced) {
				position = Vec3.subtract(position, actionData.displacement);
				actionData.displaced = false;
			} else {
				position = Vec3.sum(position, actionData.displacement);
				actionData.displaced = true;
			}
		}

		saveUserData(myID, "action", actionData);
		Entities.editEntity(myID, {position: position});		
	};

	// Reads and sets User Data (Action Data) if needed
	// Subscribes to reset channel
	this.preload = function(entityID) {
		myID = entityID;
		properties = Entities.getEntityProperties(myID, ["userData"]);
		
		if (properties.userData) {
			userData = JSON.parse(properties.userData);
			if (!userData.action) {
				saveUserData(myID, "action", defaultActionData);
			} 
		} else {
			Entities.editEntity(myID, {"userData": JSON.stringify({})});
			saveUserData(myID, "action", defaultActionData);
		}

		Messages.subscribe(resetChannel);
		Messages.messageReceived.connect(onMessageReceived);
	};

	// Unsubscribes from reset channel
	this.unload = function(entityID) {
		Messages.messageReceived.disconnect(onMessageReceived);
		Messages.unsubscribe(resetChannel);
	}

	// If message received on the reset channel is "set":
	// - saves user data and properties to be reset in a special "resetData" field in User Data
	// If message received on the reset channel is "reset":
	// - retrieves the resetData and restores User Data and the properties to be reset
	function onMessageReceived(channel, message, sender, localOnly) {
		if (channel === resetChannel) {
			if (message === "set") {
				var resetData = {
					action: {},
					properties: {}
				};
				resetData.action = getUserData(myID, "action");
				properties = Entities.getEntityProperties(myID, resetProperties);
				resetProperties.forEach( 
					function (prop) {
						resetData.properties[prop] = properties[prop];
					}
				);
				saveUserData(myID, "resetData", resetData);

				entityName = Entities.getEntityProperties(myID, ["name"]).name;
				print(entityName + " " + myID + " saved reset data");
			}

			if (message === "reset") {
				resetData = getUserData(myID, "resetData");
				if (resetData) {
					resetProperties.forEach( 
						function (prop) {
							properties = {};
							properties[prop] = resetData.properties[prop];
							Entities.editEntity(myID, properties);
						}
					);

					saveUserData(myID, "action", resetData.action);
				} else {
					entityName = Entities.getEntityProperties(myID, ["name"]).name;
					print("ERROR: " + entityName + " " + myID + " failed to retrieve reset data");
				}
			}
		}
	}

	// Returns the value associated with the specified "key" in the User Data
	function getUserData(entityID, key) {
		userData = JSON.parse(Entities.getEntityProperties(entityID, ["userData"]).userData);
		return userData[key];
	}

	// Overwrites the value in the User Data associated with the specified "key"
	function saveUserData(entityID, key, data) {
		userData = JSON.parse(Entities.getEntityProperties(entityID, ["userData"]).userData);
		userData[key] = data;
		Entities.editEntity(entityID, {"userData": JSON.stringify(userData)});
	}

});