export const models = {
    users: {
        name: '',
        totalChat: 0
    },
    groups: {
        access: false,
        antilink: false,
        welcome: {
            enabled: true,
            text: 'welcome @user to @group!\ntime: @time'
        },
        leave: {
            enabled: true,
            text: 'goodbye @user from @group!\ntime: @time'
        }
    },
    settings: {
        self: false,
        autoread: false,
        queue: true,
        accessOnly: false
    },
    plugins: {}
}
