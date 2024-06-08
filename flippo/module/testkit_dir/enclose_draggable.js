export function activate_module(lain) {

    lain.rom.removeDraggable = function(button) {
        var draggableElement = button.closest('.draggable');
        if (draggableElement) {
            var dataSet = parseInt(draggableElement.getAttribute('data-set'), 10);
            var cacheIndex = lain.cache.findIndex(function(item) { return item.domset === dataSet; });
            if (cacheIndex !== -1) {
                
                lain.rom.removeCacheItem({ index: cacheIndex });
            }
            draggableElement.remove();
            button.remove(); // Remove the element from the DOM
        }
        // Find and remove the corresponding cache item

    };
    lain.rom.enclose_draggable = (originalObject) => {
        var newMedia = '<div class="draggable"><button style="margin:2px;" onclick="alice.rom.removeDraggable(this)">X</button>' +
        '<div class="dragged_content resizable">' + originalObject.media + '</div></div>';
        var newName = 'draggable enclosure of ' + originalObject.name;
        var modifiedObject = { ...originalObject, media: newMedia, name: newName };
        return modifiedObject;
    }

}