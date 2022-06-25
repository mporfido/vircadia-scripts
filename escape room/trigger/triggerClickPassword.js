(function () {

	var myID;

	var defaultTriggerData = {
		question: "Inserisci la password",
		defaultAnswer: "####",
		answer: "1234",
		correct: "risposta esatta!",
		wrong: "risposta sbagliata!",
	}

	this.clickDownOnEntity = function(entityID) {
		var targets = getUserData(entityID, "targets")
		var targetsWrongAnswer = getUserData(entityID, "targetsWrongAnswer")

		triggerData = getUserData(myID, "trigger");
		var answer = Window.prompt(triggerData.question, triggerData.defaultAnswer);

		if (answer === triggerData.answer) {
			if (triggerData.correct) {
				Window.alert(triggerData.correct);
			}
			targets.forEach(
				function(target) {
					Entities.callEntityMethod(target, "performAction");
				}
			);
		} else {
			if (triggerData.wrong) {
				Window.alert(triggerData.wrong);
			}
			targetsWrongAnswer.forEach(
				function(target) {
					Entities.callEntityMethod(target, "performAction");
				}
			);
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
			if (!userData.targets) {
				saveUserData(myID, "targetsWrongAnswer", []);
			}
		} else {
			Entities.editEntity(myID, {"userData": JSON.stringify({})});
			saveUserData(myID, "trigger", defaultTriggerData);
			saveUserData(myID, "targets", []);
			saveUserData(myID, "targetsWrongAnswer", []);
		}
	};

	function getUserData(entityID, key) {
		userData = JSON.parse(Entities.getEntityProperties(entityID, ["userData"]).userData);
		return userData[key];
	}

	function saveUserData(entityID, key, data) {
		userData = JSON.parse(Entities.getEntityProperties(entityID, ["userData"]).userData);
		userData[key] = data;
		Entities.editEntity(entityID, {"userData": JSON.stringify(userData)});
	}

});