package main

var dirDatabase = map[string]interface{}{
	"example.com": "dir_example_com.js",
	"default":     "testkit_dir.js",
}

// modules when evaluated append to alice.dir global var
