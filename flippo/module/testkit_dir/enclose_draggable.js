export function activate_module(lain) {

    lain.rom.removeDraggable = function(button, originalURI) {
        console.log(button, originalURI)
        var draggableElement = button.closest('.draggable');
        if (draggableElement) {
            draggableElement.remove(); // Remove the element from the DOM
        }
        // Find and remove the corresponding cache item
        var cacheIndex = lain.cache.findIndex(function(item) { return item.uri === originalURI; });
        if (cacheIndex !== -1) {
            lain.rom.removeCacheItem({ index: cacheIndex });
        }
        button.remove();
    };
    lain.rom.enclose_draggable = (originalObject) => {
        var newMedia = '<div class="draggable">' +
        '<button style="margin:2px;"onclick="alice.rom.removeDraggable(this, \'' + originalObject.uri + '\')">X</button>' +
        '<div class="dragged_content">' + originalObject.media + '</div></div>';
        var newName = 'draggable enclosure of ' + originalObject.name;
        var modifiedObject = { ...originalObject, media: newMedia, name: newName };
        return modifiedObject;
    }

}