var loremIpsum = "";

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var asciiConversionMap = {
	":heart:": 172,
	":button_a:": 255,
	":button_b:": 193,
	":button_x:": 230,
	":button_y:": 189
}

var buttonImages = [
	255, 193, 230, 189
]

function convertString(string) {
	for (key in asciiConversionMap) {
		string = string.replace(new RegExp(key, 'g'), String.fromCharCode(asciiConversionMap[key]));
	}

	return string;
}

var pystEngine = {
	engine: {},
	choices: [],
	executeAll: function() {
		var shouldContinue = true;
		var command = undefined;
		do {
			command = this.engine.currentScene.commands.shift();
			if (command) {
				shouldContinue = this.execute(command);
			}
		} while (command != undefined && shouldContinue == true)
	},
	execute: function(command) {
		console.log("COMMAND: " + command.command)
		if (command.command == "ui.narrator.say") {
			var text = convertString(command.args[1]);
			pystPane.pixi.components.textbox.text.text = text;
			return false;
		} else if (command.command == "ui.actor.say") {
			var text = convertString(command.args[1]);
			pystPane.pixi.components.textbox.text.text = capitalize(command.args[0]) + ": " + text;
			return false;
		} else if (command.command == "ui.choice.prompt") {
			this.choices.push({
				text: command.args[0],
				nextScene: command.args[1]
			});
			return true;
		} else if (command.command == "ui.choice.request") {
			var choiceString = "What do you do?\n";
			for (i = 0; i < Math.min(this.choices.length, 4); i++) {
				var choice = this.choices[i];
				choiceString += "\t\t" + String.fromCharCode(buttonImages[i]) + choice.text + "\n";
			}
			pystPane.pixi.components.textbox.text.text = choiceString;
			return false;
		} else if (command.command == "ui.scene.enter") {
			var location = command.args[0];
			var transition = command.args[1];
			var speed = command.args[2];

			pystPane.pixi.components.scene.background.visible = false;
			pystPane.pixi.components.scene.background.texture = PIXI.loader.resources["scenes." + location + ".default"].texture;
			pystPane.pixi.components.scene.background.width = pystPane.pixi.renderer.width;
			pystPane.pixi.components.scene.background.height = pystPane.pixi.renderer.height;

			if (transition == "") {
				pystPane.pixi.components.scene.background.visible = true;
				return true;
			}

			pystPane.pixi.transitions.background.push({
				sprite1: pystPane.pixi.components.scene.background,
				sprite2: undefined,
				type: transition,
				speed: speed,
				started: false
			});

			return true;
		} else if (command.command == "ui.scene.exit") {
			var transition = command.args[0];
			var speed = command.args[1];
			
			if (transition == "") {
				pystPane.pixi.components.scene.background.visible = false;
				return true;
			}

			pystPane.pixi.transitions.background.push({
				sprite1: pystPane.pixi.components.scene.background,
				sprite2: undefined,
				type: transition,
				speed: speed,
				started: false
			});

			return true;
		} else if (command.command == "ui.actor.change") {
			var actor = command.args[0] + "." + command.args[1];
			var actorPos = pystPane.pixi.components.actorMapping[command.args[0]];
			var sprite = pystPane.pixi.components.actors[actorPos];
			var layout = pystEngine.shit.layout.actors[actorPos];
			var transition1 = command.args[2];
			var transition2 = command.args[3];
			var speed = command.args[4];
			
			sprite.texture = PIXI.loader.resources["actors." + actor].texture;
			sprite.visible = true;
			sprite.scale.x = layout.scale;
			sprite.scale.y = layout.scale;

			var pos = calculatePosition(layout, pystPane.pixi.renderer, sprite);
			sprite.x = pos.x;
			sprite.y = pos.y;

			if (transition1 == "" || transaction2 == "") {
				sprite.visible = true;
				return true;
			}

			pystPane.pixi.transitions.actors[actorPos].push({
				sprite1: sprite,
				sprite2: undefined,
				type: transition2,
				speed: speed,
				started: false
			});

			return true;
		} else if (command.command == "ui.actor.enter") {
			var actor = command.args[0] + "." + command.args[1];
			var sprite = pystPane.pixi.components.actors[command.args[2]];
			var layout = this.shit.layout.actors[command.args[2]];
			var transition = command.args[3];
			var speed = command.args[4];
			
			sprite.texture = PIXI.loader.resources["actors." + actor].texture;
			sprite.visible = false;
			sprite.scale.x = layout.scale;
			sprite.scale.y = layout.scale;
			sprite.alpha = 0.0;

			var pos = calculatePosition(layout, pystPane.pixi.renderer, sprite);
			sprite.x = pos.x;
			sprite.y = pos.y;

			pystPane.pixi.components.actorMapping[command.args[0]] = command.args[2];

			if (transition == "") {
				sprite.visible = true;
				return true;
			}

			pystPane.pixi.transitions.actors[command.args[2]].push({
				sprite1: sprite,
				sprite2: undefined,
				type: transition,
				speed: speed,
				started: false
			});

			return true;
		} else if (command.command == "ui.actor.exit") {
			var actorPos = pystPane.pixi.components.actorMapping[command.args[0]];
			var sprite = pystPane.pixi.components.actors[actorPos];
			var transition = command.args[1];
			var speed = command.args[2];

			if (transition == "") {
				sprite.visible = false;
				return true;
			}

			pystPane.pixi.transitions.actors[actorPos].push({
				sprite1: sprite,
				sprite2: undefined,
				type: transition,
				speed: speed,
				started: false
			});

			return true;
		} else {
			return true;
		}
	}
};

var pystPane = {
	pixi: {
		stage: {},
		renderer: {},
		transitions: {
			background: [],
			actors: {
			}
		},
		components: {
			layers: {
				foreground: {},
				background: {}
			},
			actors: {},
			actorMapping: {},
			scene: {
				actors: [],
				background: {}
			},
			textbox: {
				text: {},
				skin: {}
			}
		},
		textStyle: function(width) {
			return {
					fontFamily : 'Arial', 
					fontSize: 15, 
					fill : 'black', 
					align : 'left',
					wordWrap: true, 
					wordWrapWidth: width
				}
		}
	}
};

// Keyboard object
function keyboard(keyCode) {
	var key = {};
	key.code = keyCode;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;
	//The `downHandler`
	key.downHandler = function(event) {
		if (event.keyCode === key.code) {
			if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
		}
		event.preventDefault();
	};

	//The `upHandler`
	key.upHandler = function(event) {
		if (event.keyCode === key.code) {
			if (key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
		}
		event.preventDefault();
	};

	//Attach event listeners
	window.addEventListener(
		"keydown", key.downHandler.bind(key), false
	);
	window.addEventListener(
		"keyup", key.upHandler.bind(key), false
	);

	return key;
}

function parsePosition(positionString) {
}

function calculatePosition(layout, container, sprite) {
	var pos = {}

	if (layout.left != undefined) {
		pos.x = layout.left;
	}

	if (layout.top != undefined) {
		pos.y = layout.top;
	}

	if (layout.right != undefined) {
		pos.x = container.width - layout.right - sprite.width;
	}

	if (layout.bottom != undefined) {
		pos.y = container.height - layout.bottom - sprite.height;
	}

	if (layout.hAlign != undefined) {
		if (layout.hAlign == "center") {
			pos.x = (container.width - sprite.width)/2;
		} else if (layout.hAlign == "right") {
			pos.x = container.width - sprite.width;
		} else if (layout.hAlign == "left") {
			pos.x = 0;
		}
	}

	if (layout.vAlign != undefined) {
		if (layout.vAlign == "middle") {
			pos.y = (container.height - sprite.height)/2;
		} else if (layout.vAlign == "top") {
			pos.y = 0;
		} else if (layout.vAlign == "bottom") {
			pos.y = container.height - sprite.height;
		}
	}

	return pos
}

// Setup PixiJS
function setup() {
	// Resize the renderer
	var renderer = pystPane.pixi.renderer;
	renderer.resize(800, 600);

	// Create containers for layers
	var fg = pystPane.pixi.components.layers.foreground = new PIXI.Container();
	var bg = pystPane.pixi.components.layers.background = new PIXI.Container();

	// Create foreground layer
	var textBox = pystPane.pixi.components.textbox.skin = new PIXI.Sprite(
			PIXI.loader.resources["skins.textbox.default"].texture
		);
	textBox.scale.x = 2;
	textBox.scale.y = 2;

	var fontXml = $.parseXML(atob(pystEngine.shit.assets.fonts["Marker"].xml));
	var textBoxFont = pystEngine.shit.layout.textbox.font;
	PIXI.extras.BitmapText.registerFont(
		fontXml,
		PIXI.loader.resources["fonts." + textBoxFont].texture);
	var text = pystPane.pixi.components.textbox.text = new PIXI.extras.BitmapText(
			"",
			{ 
				font: '25px ' + textBoxFont, 
				align: 'left'
			}
		);
	text.x = 15;
	text.y = 20;
	text.maxWidth = textBox.width - 30;

	// Create background layer
	pystPane.pixi.components.scene.background = new PIXI.Sprite();
	pystPane.pixi.components.scene.background.width = renderer.width;
	pystPane.pixi.components.scene.background.height = renderer.height;

	pystPane.pixi.components.scene.actors.push(new PIXI.Sprite());

	// Add components to foreground layer
	pystPane.pixi.components.layers.foreground.addChild(pystPane.pixi.components.textbox.skin);
	pystPane.pixi.components.layers.foreground.addChild(pystPane.pixi.components.textbox.text);

	// Add components to background layer
	pystPane.pixi.components.layers.background.addChild(pystPane.pixi.components.scene.background);
	for (i=0; i < pystPane.pixi.components.scene.actors.length; i++) {
		var sprite = pystPane.pixi.components.scene.actors[i];
		var renderer = pystPane.pixi.renderer;

		pystPane.pixi.components.layers.background.addChild(pystPane.pixi.components.scene.actors[i]);
	}

	// Scale and place foreground
	fg.x = (renderer.width - fg.width) / 2;
	fg.y = renderer.height - fg.height - 10;

	// Add actor positions to stage
	for (var actorKey in pystEngine.shit.layout.actors) {
		var actorPos = pystEngine.shit.layout.actors[actorKey];
		console.log(actorKey + ": " + actorPos);

		var actor = pystPane.pixi.components.actors[actorKey] = new PIXI.Sprite();
		pystPane.pixi.components.layers.background.addChild(actor);
	}

	// Add layers to stage
	pystPane.pixi.stage.addChild(pystPane.pixi.components.layers.background);
	pystPane.pixi.stage.addChild(pystPane.pixi.components.layers.foreground);

	// Set test text
	pystPane.pixi.components.textbox.text.text = loremIpsum;

	// Configure keyboard listeners
	var enter = keyboard(13);

	// On button press or click, advance the queue
	enter.press = onEnter;
	document.addEventListener("click", onEnter, false);

	// Listen for number keys for choices
	window.addEventListener("keydown", function(event) {
		if (event.keyCode > 48 && event.keyCode < 58) {
			// Get choice
			var choice = pystEngine.choices[(event.keyCode - 48) - 1];
			pystEngine.engine.currentScene.nextSceneHref = pystEngine.engine.currentScene.choices[choice.nextScene];
			pystPane.pixi.components.textbox.text.text = "You chose '" + choice.text + "'";

			// Get href for choice
			var href = pystEngine.engine.currentScene.choices[choice.nextScene];
			pystEngine.choices = [];
		}
	}, false);

	// Retrieve first scene
	$.get("http://localhost:8080/pyst-service/v1/engine/" + pystEngine.engine.id + "/scene/next", function(data) {
		pystEngine.engine.currentScene = data;
		pystEngine.executeAll();
	});

	// Start render loop
	renderLoop();
}

function onEnter() {
	// If command queue still has commands, pull off another and run it.
	if (pystEngine.engine.currentScene.commands && pystEngine.engine.currentScene.commands.length >= 1) {
		pystEngine.executeAll();
	}

	// If there is a next scene and no choice to be made, retrieve next scene.
	if (pystEngine.engine.currentScene.nextSceneHref) {
		$.get(pystEngine.engine.currentScene.nextSceneHref, function(data) {
			pystEngine.engine.currentScene = data;

			if (!pystEngine.engine.currentScene.commands || pystEngine.engine.currentScene.commands.length < 1) {
				onEnter();
				return;
			}

			pystEngine.executeAll();
		});
	}
}

// Render loop
function renderLoop() {
	// Loop this function at 60 frames per second
	requestAnimationFrame(renderLoop);

	// Handle transitions for background
	if (pystPane.pixi.transitions.background.length >= 1) {
		var transition = pystPane.pixi.transitions.background[0];
		
		// Handle transition
		if (transitionLoop(transition)) {
			pystPane.pixi.transitions.background.shift();
		}
	}

	// Handle actor transitions
	for (var key in pystPane.pixi.transitions.actors) {
		var actorTransitions = pystPane.pixi.transitions.actors[key];

		if (actorTransitions.length >= 1) {
			var transition = actorTransitions[0];

			// Handle transition
			if (transitionLoop(transition)) {
				actorTransitions.shift();
			}
		}
	}

	// Render the stage
	pystPane.pixi.renderer.render(pystPane.pixi.stage)
}

function transitionLoop(transition) {
	var increment = 0.1/transition.speed;

	if (transition.type == "fadeIn") {			// Fade in
		if (!transition.started) {
			transition.sprite1.alpha = 0.0;
			transition.sprite1.visible = true;
			transition.started = true;
		}

		if (transition.sprite1.alpha + increment >= 1.0) {
			transition.sprite1.alpha = 1.0;
			return true;
		} else {
			transition.sprite1.alpha += increment;
		}
	} else if (transition.type = "fadeOut") {	// Fade out
		if (!transition.started) {
			transition.started = true;
		}

		if (transition.sprite1.alpha - increment <= 0.0) {
			transition.sprite1.alpha = 0.0;
			transition.sprite1.visible = false;
			return true;
		} else {
			transition.sprite1.alpha -= increment;
		}
	}

	return false;
}

$(function() {
	var canvas = document.getElementById("primary-surface");

	//Create the renderer
	pystPane.pixi.renderer = PIXI.autoDetectRenderer(canvas.width, canvas.height, {view: canvas, transparent: true});

	//Create a container object called the `stage`
	pystPane.pixi.stage = new PIXI.Container();

	$.ajaxSetup({
		contentType: "application/json",
		dataType: "json"
	});

	// Create game session
	$.post("http://localhost:8080/pyst-service/v1/engine", 
		JSON.stringify({
			"gameName": "lon",
			"playerId": "fart"
		}))
		.done(function(data) {
			// Store engine data
			pystEngine.engine = data;

			// Get shit
			$.get("http://localhost:8080/pyst-service/v1/engine/" + pystEngine.engine.id + "/shit", function(data) {
				pystEngine.shit = data;

				var loader = PIXI.loader;

				for (var key in pystEngine.shit.layout.actors) {
					pystPane.pixi.transitions.actors[key] = [];
				}

				// Load font
				//loader.add("fonts/marker_font.fnt", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.DOCUMENT });

				// Load fonts
				for (var fontKey in pystEngine.shit.assets.fonts) {
					var imageKey = "fonts." + fontKey;
					var font = pystEngine.shit.assets.fonts[fontKey];
					console.log("LOADING: " + imageKey + "(image/png)");
					loader.add(imageKey, "data:image/png;base64," + font.image);
				}

				// Load actors
				for (var actorKey in pystEngine.shit.assets.actors) {
					var imageKeyBase = "actors." + actorKey;
					var actor = pystEngine.shit.assets.actors[actorKey];
					for (var moodKey in actor.moods) {
						var mood = actor.moods[moodKey];
						var imageKey = imageKeyBase + "." + moodKey;
						console.log("LOADING: " + imageKey + "(" + mood.mimeType + ")");
						loader.add(imageKey, "data:" + mood.mimeType + ";base64," + mood.image);
					}
				}

				// Load scenes
				for (var sceneKey in pystEngine.shit.assets.scenes) {
					var imageKeyBase = "scenes." + sceneKey;
					var scene = pystEngine.shit.assets.scenes[sceneKey];
					for (var variantKey in scene.variants) {
						var variant = scene.variants[variantKey];
						var imageKey = imageKeyBase + "." + variantKey;
						console.log("LOADING: " + imageKey + "(" + variant.mimeType + ")");
						loader.add(imageKey, "data:" + variant.mimeType + ";base64," + variant.image);
					}
				}

				// Load skins
				for (var skinKey in pystEngine.shit.assets.skins) {
					var imageKeyBase = "skins." + skinKey;
					var skin = pystEngine.shit.assets.skins[skinKey];
					for (var variantKey in skin.variants) {
						var variant = skin.variants[variantKey];
						var imageKey = imageKeyBase + "." + variantKey;
						console.log("LOADING: " + imageKey + "(" + variant.mimeType + ")");
						loader.add(imageKey, "data:" + variant.mimeType + ";base64," + variant.image);
					}
				}

				loader.load(setup);
			});
		});
});