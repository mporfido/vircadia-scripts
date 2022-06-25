(function () {

	var myID;

	this.clickDownOnEntity = function(entityID) {
		var targets = getUserData(entityID, "targets")
		targets.forEach(
			function(target) {
				Entities.callEntityMethod(target, "performAction");
			}
		);
	};

	this.preload = function(entityID) {
		myID = entityID;
		properties = Entities.getEntityProperties(myID, ["userData"]);
		
		if (properties.userData) {
			userData = JSON.parse(properties.userData);
			if (!userData.targets) {
				saveUserData(myID, "targets", []);
			} 
		} else {
			Entities.editEntity(myID, {"userData": JSON.stringify({})});
			saveUserData(myID, "targets", []);
		}
	};

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