var loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sit amet arcu convallis, feugiat ligula ut, blandit ante. Sed ornare quis dolor eget venenatis. Nam quis lobortis justo. Suspendisse potenti. In ultrices, leo in mattis aliquam, ligula risus vestibulum metus, et congue velit ipsum vel neque. Aliquam volutpat sodales ipsum, eu lacinia est pretium quis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas lacinia, magna vitae luctus pellentesque, metus est venenatis lacus, at consectetur lorem ante quis enim. Quisque vel nulla eget purus blandit rutrum quis eu ipsum. Maecenas aliquam ac leo vitae efficitur. Nulla sodales nunc id risus egestas, vel auctor nibh ultricies. Integer auctor, odio ut suscipit pharetra, nulla tortor congue dolor, eget ultrices lectus urna et enim. Aenean viverra sapien cursus suscipit mollis. Fusce faucibus eros at eros egestas placerat.";

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
			pystPane.pixi.components.textbox.text.text = command.args[1];
			return false;
		} else if (command.command == "ui.actor.say") {
			pystPane.pixi.components.textbox.text.text = capitalize(command.args[0]) + ": " + command.args[1];
			return false;
		} else if (command.command == "ui.choice.prompt") {
			this.choices.push({
				text: command.args[0],
				nextScene: command.args[1]
			});
			return true;
		} else if (command.command == "ui.choice.request") {
			// Pop choice box
			var choiceString = "What do you do?\n";
			for (i = 0; i < this.choices.length; i++) {
				var choice = this.choices[i];
				choiceString += "\t\t" + (i + 1) + ") " + choice.text + "\n";
			}
			pystPane.pixi.components.textbox.text.text = choiceString;
			return false;
		} else if (command.command == "ui.scene.move") {
			var location = command.args[0];
			pystPane.pixi.components.scene.background.texture = PIXI.loader.resources["scenes." + location + ".default"].texture;
			pystPane.pixi.components.scene.background.width = pystPane.pixi.renderer.width;
			pystPane.pixi.components.scene.background.height = pystPane.pixi.renderer.height;
			return true;
		} else if (command.command == "ui.scene.add") {
			var sprite = pystPane.pixi.components.actors[command.args[1]];
			var layout = pystEngine.shit.layout.actors[command.args[1]];
			var actor  = pystEngine.shit.assets.actors[command.args[0]];
			sprite.visible = false;
			pystPane.pixi.components.actorMapping[command.args[0]] = command.args[1];
			return true;
		} else if (command.command == "ui.scene.remove") {
			var actorPos = pystPane.pixi.components.actorMapping[command.args[0]];
			var sprite = pystPane.pixi.components.actors[actorPos];
			sprite.visible = false;
			pystPane.pixi.components.actorMapping[command.args[0]] = undefined;
			return true;
		} else if (command.command == "ui.actor.change") {
			var actor = command.args[0] + "." + command.args[1];
			var actorPos = pystPane.pixi.components.actorMapping[command.args[0]];
			var sprite = pystPane.pixi.components.actors[actorPos];
			var layout = pystEngine.shit.layout.actors[actorPos];
			
			sprite.texture = PIXI.loader.resources["actors." + actor].texture;
			sprite.visible = true;
			sprite.scale.x = layout.scale;
			sprite.scale.y = layout.scale;

			var pos = calculatePosition(layout, pystPane.pixi.renderer, sprite);
			sprite.x = pos.x;
			sprite.y = pos.y;

			return true;
		}else {
			return true;
		}
	}
};

var pystPane = {
	pixi: {
		stage: {},
		renderer: {},
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
	var text = pystPane.pixi.components.textbox.text = new PIXI.Text(
			"",
			pystPane.pixi.textStyle(textBox.width - 30)
		);
	text.x = 15;
	text.y = 20;

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

	// On enter press, do this
	enter.press = function () {
		// If command queue still has commands, pull off another and run it.
		if (pystEngine.engine.currentScene.commands && pystEngine.engine.currentScene.commands.length >= 1) {
			pystEngine.executeAll();
			return;
		}

		// If there is a next scene and no choice to be made, retrieve next scene.
		if (pystEngine.engine.currentScene.nextSceneHref) {
			$.get(pystEngine.engine.currentScene.nextSceneHref, function(data) {
				pystEngine.engine.currentScene = data;
				pystEngine.executeAll();
			});
			return;
		}
	}

	// Listen for number keys for choices
	window.addEventListener("keydown", function(event) {
		if (event.keyCode > 48 && event.keyCode < 58) {
			var choice = pystEngine.choices[(event.keyCode - 48) - 1];
			var href = pystEngine.engine.currentScene.choices[choice.nextScene];
			pystEngine.choices = [];

			// Get the next scene and execute the first command
			$.get(href, function(data) {
				pystEngine.engine.currentScene = data;
				pystEngine.executeAll();
			});
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

// Render loop
function renderLoop() {
	// Loop this function at 60 frames per second
	requestAnimationFrame(renderLoop);

	// Render the stage
	pystPane.pixi.renderer.render(pystPane.pixi.stage)
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