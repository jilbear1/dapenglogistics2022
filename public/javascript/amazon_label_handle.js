function deleteConfirm(id) {
    const code =  prompt(`Please enter the passcode to confirm the deletion of REQ box (id: ${id})`);
    if (code == '0523') {
        if (confirm('Friednly reminder: all items assocaited with this REQ box will be removed!')) {
            updateReqContainer(id);
        }
    } else {
        alert('Incorrect passcode!')
    }
};
async function updateReqContainer(container_id) {
    const id = container_id;
    const response = await fetch(`/api/container/destroyBulk`, {
        method: 'DELETE',
        body: JSON.stringify({
            id: id
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        alert('this requested container has been confirmed for deletion!');
        location.reload();
    }

};
