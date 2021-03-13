require('dotenv').config();


module.exports = {
    name: "도움",
    aliases: ["help", '도움말', '명령어', '명령어', 'ㅗ디ㅔ'],
    /**
     * @param {import('discord.js').Client} client 
     * @param {import('discord.js').Message} message 
     * @param {Array} args 
     */
    async run(client, message, args = []) {
        message.author.send(
`//add <검색어> - 검색어를 유튜브에 검색해서 대기열에 추가합니다
//play - 대기열에 추가한 노래들을 재생합니다
//volume <1 ~ 100> - 음악의 볼륨을 설정합니다
//stop - 대기열을 초기화하고 음악을 정지합니다
//pause - 노래를 일시정지합니다
//resume - 일시정지한 노래를 재생합니다
//skip - 노래를 스킵합니다
//queue - 현재 노래 대기열을 확인합니다
//playlist <검색어> - 검색어를 유튜브에서 검색해서 그 플레이리스트 안에 있는 노래들을 추가하는 기능인데 현재 버그 걸림`);
        message.reply('개인 메시지로 도움말을 보냈어요!');
    }
}