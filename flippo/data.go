package main

var dirDatabase = map[string]interface{}{
	"hosts": map[string]interface{}{
		"http://localhost:8083/": map[string]interface{}{
			"testkit": []string{"example_dir.js", "exampleb_js.js"},
		},
	},
	"uri": map[string]interface{}{
		"testkit": []string{"testkit_dir.js"},
	},
}

// modules when evaluated append to alice.dir
