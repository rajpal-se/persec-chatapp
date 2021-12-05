const PB = () => {	// PageBlocker
	const identityClass = 'PBidentity6385991254'
	const createNode = () => {
		/* 
			<div class="PBstyle PBidentity6385991254">
				<div class="con">
					<div class="loaderCon">
						<div class="loader">
							<span></span>
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
					<p class="message">
					</p>
				</div>
			</div>(new Date()).getTime()
		*/
		
		const newEle = (eleName, className = '') => {
			const e = document.createElement(eleName)
			e.className = className
			return e
		}
		
		const rootNode = newEle('div', `PBstyle ${identityClass}`)
		const childDiv = newEle('div', 'con')
		const loaderCon = newEle('div', 'loaderCon')
		const message = newEle('p', 'message')
		const loader = newEle('div', 'loader')
		
		loader.append( newEle('span') )
		loader.append( newEle('span') )
		loader.append( newEle('span') )
		loader.append( newEle('span') )

		loaderCon.append(loader)

		childDiv.append(loaderCon)
		childDiv.append(message)

		rootNode.append(childDiv)

		return {
			rootNode, childDiv, loaderCon, message, loader
		}
	}

	const show = (message = '') => {
		const refObj = createNode()
		if(message === ''){
			refObj.message.style.display = 'none'
		}
		else{
			refObj.message.innerHTML = message
		}

		
		const div = refObj.rootNode
		window.document.documentElement.querySelector('body').append(div)
	}
	const remove = () => {
		const nodes = document.querySelectorAll(`.${identityClass}`)
		Array.from(Array(nodes.length)).map((v, i) => {
			nodes[i].parentNode.removeChild(nodes[i])
		})
	}

	return {
		createNode,
		show,
		remove
	}
}


/* Use Case

Case 1: With some message
PB().show('Hello')
PB().remove()


Case 2: Without message
PB().show()
PB().remove()

*/