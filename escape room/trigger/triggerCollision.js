(function () {
	var myID;

	var resetChannel = "reset.escape.room"
	var resetProperties = []
	var defaultTriggerData = {
		keyName: "key1234",
		deleteKey: true
	}

	this.collisionWithEntity = function (entityID, otherID, collision) {
		var name = Entities.getEntityProperties(otherID, ["name"]).name;
		var triggerData = getUserData(myID, "trigger");

		if (name === triggerData.keyName) {
			var targets = getUserData(entityID, "targets");
			targets.forEach(
				function(target) {
					Entities.callEntityMethod(target, "performAction");
				}
			);

			if (triggerData.deleteKey) {
				Entities.deleteEntity(otherID);
			}
		}
    };

    this.preload = function(entityID) {
		myID = entityID;
		properties = Entities.getEntityProperties(myID, ["userData"]);
		
		if (properties.userData) {
			userData = JSON.parse(properties.userData);
			if (!userData.trigger) {
				saveUserData(myID, "trigger", defaultTriggerData);
			} 
			if (!userData.targets) {
				saveUserData(myID, "targets", []);
			}
		} else {
			Entities.editEntity(myID, {"userData": JSON.stringify({})});
			saveUserData(myID, "trigger", defaultTriggerData);
			saveUserData(myID, "targets", []);
		}

		Messages.subscribe(resetChannel);
		Messages.messageReceived.connect(onMessageReceived);
	};

	this.unload = function(entityID) {
		Messages.messageReceived.disconnect(onMessageReceived);
		Messages.unsubscribe(resetChannel);
	}

	function onMessageReceived(channel, message, sender, localOnly) {
		if (channel === resetChannel) {
			if (message === "set") {
				var resetData = {
					trigger: {},
					properties: {}
				};
				resetData.trigger = getUserData(myID, "trigger");
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

					saveUserData(myID, "trigger", resetData.trigger);
				} else {
					entityName = Entities.getEntityProperties(myID, ["name"]).name;
					print("ERROR: " + entityName + " " + myID + " failed to retrieve reset data");
				}
			}
		}
	}

    function getUserData(entityID, key) {
		userData = JSON.parse(Entities.getEntityProperties(entityID, ["userData"]).userData);
		return userData[key];
	}

	function saveUserData(entityID, key, data) {
		userData = JSON.parse(Entities.getEntityProperties(entityID, ["userData"]).userData);
		userData[key] = data;
		Entities.editEntity(entityID, {"userData": JSON.stringify(userData)});
	}
})