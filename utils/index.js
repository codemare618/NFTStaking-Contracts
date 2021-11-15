const {ethers, web3} = require('hardhat');

async function getChainId() {
    return web3.eth.getChainId();
}

async function getChainIdWeb3BN() {
    return getChainId().then(web3.utils.toBN);
}

async function getChainIdBytes() {
    const chainIDBN = await getChainIdWeb3BN();
    const chainIDEncoded = web3.eth.abi.encodeParameter("uint256", chainIDBN);
    return web3.utils.hexToBytes(chainIDEncoded);
}

/**
 * Conver ethers BN to Ethers B
 * @param number : web3.utils.BN|ethers.BigNumber
 * @returns {Promise<ethers.BigNumber>}
 */
function toEthersBN(number) {
    if (!ethers.BigNumber.isBigNumber(number)) {
        return ethers.BigNumber.from(number.toString());
    }
    return number;
}

function toWeb3BN(number) {
    if (ethers.BigNumber.isBigNumber(number)) {
        return web3.utils.toBN(number.toString());
    }
    return number;
}

function splitSignature(signature) {
    return ethers.utils.splitSignature(signature);
}

/**
 * Sign meta transaction
 * @param contract : web3.eth.Contract|ethers.Contract
 * @param signer : ethers.Signer signer of transaction
 * @param functionSignature : string or bytearray
 * @returns {r, s, v}
 */
async function signMetaTransaction(contract, functionSignature, signer) {
    const domain = {
        name: await contract.name(),
        version: '1',
        verifyingContract: contract.address,
        salt: await getChainIdBytes()
    };

    if (typeof functionSignature === 'string') {
        // this is hex string, so convert into byte array
        functionSignature = ethers.utils.arrayify(functionSignature);
    }

    const types = {
        MetaTransaction: [
            {name: 'nonce', type: 'uint256'},
            {name: 'from', type: 'address'},
            {name: 'functionSignature', type: 'bytes'}
        ]
    };

    const from = await signer.getAddress();
    let nonce = await contract.getNonce(from);

    const metaTransaction = {
        nonce: toEthersBN(nonce),
        from,
        functionSignature
    }

    const signature = await signer._signTypedData(domain, types, metaTransaction);
    return splitSignature(signature);
}

/**
 *
 * @param token : Contract deployed contracts
 * @param signer : ethers.Signer
 * @param to : string - Address of recipient
 * @param amount : web.utils.BN|ethers.BigNumber in web3.js, not hardhat
 * @returns {Promise<{r, s, v}>}
 */
async function createApproveSignature(token, signer, to, amount) {
    /*
      // Constructor of ERC20
      constructor() ERC20("Wrapped Ether", "WETH") {
        _initializeEIP712("Wrapped Ether", "1");
      }

      // They use salt instead of chainId, and
      "EIP712Domain(string name,string version,address verifyingContract,bytes32 salt)"

      // Here chainId is converted into bytes32
      domainSeperator = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                address(this),
                bytes32(getChainId())
            )
        );
    */
    // use ethers here, as this is from mobile side
    const approveABI = ["function approve(address spender, uint256 amount) returns (bool)"];
    const intf = new ethers.utils.Interface(approveABI);


    const transferSignature = intf.encodeFunctionData(intf.getFunction("approve"), [to, toEthersBN(amount)]) // This is string
    return signMetaTransaction(token, transferSignature, signer);
}

/**
 *
 * @param payer : string, The payer who will get Minted NFT
 * @param amount : web3.utils.BN|ethers.BigNumber, Amount of Coder Tokens
 * @param expiration : Number UTC expiration time in seconds
 * @param uri : string
 * @param adminSigner : ethers.Signer
 * @returns {Promise<{r, s, v}>}
 */
async function createNFTAdminSignature(payer, amount, expiration, uri, adminSigner) {
    // This is back-end part, so use web3 if possible, sign will be done by selected signer
    // this is keeccak256 of abi.encodePacked(payer, coderPay, expiration, uri)
    const hash = web3.utils.soliditySha3(
        {type: "address", value: payer},
        {type: "uint256", value: toWeb3BN(amount)},
        {type: "uint256", value: expiration},
        {type: "string", value: uri}
    );
    const signature = await adminSigner.signMessage(web3.utils.hexToBytes(hash));
    return splitSignature(signature);
}


/**
 *
 * @param nft : Contract - NFT Contract
 * @param token : Contract - Token Contract
 * @param payer : ethers.Signer - Payer who pays coder token for nft
 * @param coderAmount : web3.utils.BN|ethers.BigNumber
 * @param expiration : Number UTC seconds in Integer
 * @param uri : string
 * @param adminSigner : ethers.Signer - Verifier that authorizes mint token
 * @returns {Promise<void>}
 */
async function mintNFT(
    nft,
    token,
    payer,
    coderAmount,
    expiration,
    uri,
    adminSigner
) {
    const payerAddress = await payer.getAddress();

    // Payer signs the signature
    const payerSig = await createApproveSignature(
        token,
        payer,
        nft.address,
        coderAmount
    );

    // Admin signs the signature
    const adminSig = await createNFTAdminSignature(
        payerAddress,
        coderAmount,
        expiration,
        uri,
        adminSigner
    );

    return nft.mintWithCoder(
        coderAmount,
        payerSig.r, payerSig.s, payerSig.v,
        expiration,
        adminSig.r, adminSig.s, adminSig.v,
        uri, {from: payerAddress}
    );
}

module.exports = {
    createApproveSignature,
    signMetaTransaction,
    createNFTAdminSignature,
    mintNFT,
}
