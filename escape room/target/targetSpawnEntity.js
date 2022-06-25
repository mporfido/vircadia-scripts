(function () {

	var myID;
	var object;

	var resetChannel = "reset.escape.room"
	var resetProperties = []

	// object: contains the properties of the entity (of type Model) that will be created.
	//         can be integrated with more options from https://apidocs.vircadia.dev/Entities.html#.EntityProperties
	// singleUse: whether the action should be performed only once (true) 
	// used: false if no entity was spawned yet 
	var defaultActionData = {
		object: {
			name: "SpawnObject",
			modelURL: "https://cdn-1.vircadia.com/us-e-1/Developer/Tutorials/flashlight/flashlight2.fbx",
			relativePosition: {
				x: 0,
				y: 1,
				z: 0
			},
			rotationAngles: {
				x: 0,
				y: 0,
				z: 0
			},
			gravity: {
				x: 0,
				y: -10.0,
				z: 0
			},
			dynamic: true,
			shapeType: 'box',
			lifetime: -1,
		},
		singleUse: false,
		used: false
	}

	this.performAction = function() {
		var position = Entities.getEntityProperties(myID, ["position"]).position;
		var actionData = getUserData(myID, "action");

		objectJSON = JSON.parse(JSON.stringify(actionData.object));
		objectJSON.type = 'Model';
		objectJSON.position = Vec3.sum(position, objectJSON.relativePosition);
		objectJSON.rotation = Quat.fromVec3Degrees(objectJSON.rotationAngles);
		objectJSON.userData = {spawnedBy: myID};

		if (actionData.singleUse) {
			if (!actionData.used) {
				Entities.addEntity(objectJSON);
				actionData.used = true;
				saveUserData(myID, "action", actionData);
			}
		} else {
			Entities.addEntity(objectJSON);
		}

		
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