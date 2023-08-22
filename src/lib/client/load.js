if (typeof window != 'undefined') window.global ||= window
const {
	ClientEvent,
	CryptoEvent,
	IndexedDBCryptoStore,
	IndexedDBStore,
	createClient
} = await import('matrix-js-sdk')
const { VerifierEvent } = await import('matrix-js-sdk/lib/crypto-api')
const { verificationMethods } = await import('matrix-js-sdk/lib/crypto')

export async function loadClient() {
	if (window.matrixClient) return
	// Initialize IndexedDB stores
	const indexedDBStore = new IndexedDBStore({
		indexedDB,
		localStorage,
		dbName: 'web-sync-store'
	})
	const cryptoStore = new IndexedDBCryptoStore(indexedDB, 'crypto-store')
	await indexedDBStore.startup()

	const matrixClient = createClient({
		baseUrl: localStorage.getItem('homeserver') ?? '',
		accessToken: localStorage.getItem('token') ?? undefined,
		userId: localStorage.getItem('user_id') ?? '',
		store: indexedDBStore,
		deviceId: localStorage.getItem('device_id') ?? '',
		cryptoStore,
		verificationMethods: [verificationMethods.SAS],
		timelineSupport: true
	})

	await matrixClient.initCrypto()
	await matrixClient.startClient()
	matrixClient.setGlobalErrorOnUnknownDevices(false)
	window.matrixClient = matrixClient

	await new Promise(resolve => {
		matrixClient.once(ClientEvent.Sync, () => {
			resolve()
		})
	})

	// Handle verification requests
	matrixClient.on(CryptoEvent.VerificationRequest, async request => {
		await request.accept()
		const verifier = request.beginKeyVerification(verificationMethods.SAS)
		verifier.on(VerifierEvent.ShowSas, async sasData => {
			await sasData.confirm()
		})
		await verifier.verify()
	})
}
