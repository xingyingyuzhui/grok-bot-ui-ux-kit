# 53个头像状态的完整目录

本目录由本轮检查的状态列表和原DMG定义整理。官网列的「普通头像」指无状态形变映射，不表示没有眼睛、姿态、旋转或粒子动作。详细差异及验证边界见 [全状态检查](avatar-state-audit.md)。

| 状态 | 官网原生状态 / 形变 | DMG clips | DMG face | DMG morph | DMG next / hold |
|---|---|---|---|---|---|
| sleeping | 普通头像 | Idle_B | sleepy | — | — |
| waking | 普通头像 | Idle_B | surprised | — | idle / 1.6s |
| idle | 普通头像 | Idle_B, Idle_D, Idle_A；<48px: Idle_B | — | — | — |
| listening | 普通头像 | Idle_D | calm | — | — |
| thinking | dots | Idle_B | — | thinking | — |
| searching | 普通头像 | Idle_B | — | radar | — |
| working | 普通头像 | Working_A, Working_B, Working_C, Working_D, Working_E, Working_F | — | — | — |
| excited | 普通头像 | Done_C | — | — | — |
| surprised | 普通头像 | Idle_B | surprised | — | — |
| suspicious | 普通头像 | Idle_D | squinted | — | — |
| angry | 普通头像 | Blocked_A | squinted | — | — |
| drowsy | 普通头像 | Blocked_C | — | — | — |
| happy | 普通头像 | Done_A | — | — | — |
| curious | 普通头像 | Working_B | inspecting | — | — |
| confused | 普通头像 | Blocked_A | — | — | — |
| bored | 普通头像 | Idle_B | sleepy | — | — |
| proud | 普通头像 | Marketing_B | — | — | — |
| shy | 普通头像 | Idle_D | calm | — | — |
| sad | 普通头像 | Blocked_B | — | — | — |
| laughing | 普通头像 | Done_B | — | — | — |
| scared | 普通头像 | Idle_D | surprised | — | — |
| playful | 普通头像 | Bodymoves_A | — | — | — |
| celebrate | 普通头像 | Rotation_A | happy | — | — |
| orbit | orbit | Idle_B | — | orbit | — |
| radar | radar | Idle_B | — | radar | — |
| progress | progress | Idle_B | — | progress | — |
| spawning | gather | Idle_B | — | spawning | — |
| humming | 普通头像 | Idle_B | calm | — | — |
| dictating | wave | Idle_B | — | dictating | — |
| writing | pencil | Idle_B | — | writing | — |
| sending | send | Idle_B | — | sending | — |
| receiving | receive | Idle_B | — | receiving | — |
| uploading | dock | Idle_B | — | uploading | — |
| alerting | bang | Idle_B | — | alerting | — |
| powering-down | standby | Idle_B | — | powering-down | — |
| streaming | 不支持 | Streaming_A, Streaming_B, Streaming_C | — | — | — |
| reading | 不支持 | Working_A, Working_B, Working_C, Working_D, Working_E, Working_F | — | — | — |
| coding | 不支持 | Working_A, Working_B, Working_C, Working_D, Working_E, Working_F | — | — | — |
| running | 不支持 | Working_A, Working_B, Working_C, Working_D, Working_E, Working_F | — | — | — |
| computing | 不支持 | Working_A, Working_B, Working_C, Working_D, Working_E, Working_F | — | — | — |
| controlling | 不支持 | Working_A, Working_B, Working_C, Working_D, Working_E, Working_F | — | — | — |
| waiting | 不支持 | Idle_B | — | orbit | — |
| blocked | 不支持 | Blocked_A | — | — | drowsy / 120s |
| finished | 不支持 | Done_B, Done_A | happy | — | idle / 片段结束后 |
| failed | 不支持 | Blocked_B | — | — | idle / 片段结束后 |
| approving | 不支持 | Rotation_C | — | — | idle / 片段结束后 |
| loading | 不支持 | Idle_B | — | progress | — |
| bouncing | 不支持 | Idle_B | — | bouncing | — |
| notifying | 不支持 | Done_B | surprised | — | — |
| dragging | 不支持 | Idle_B | surprised | — | — |
| logo | 不支持 | Logo_A, Logo_B | — | — | — |
| showcase | 不支持 | Marketing_A, Marketing_B, Marketing_C, Marketing_D | — | — | — |
| turntable | 不支持 | Rotation_B | — | — | — |

官网wrapper还对loading、notifying、bouncing、dragging提供别名映射；它们不属于官网35原生状态。当前mountAvatar拒绝这些别名，避免与DMG同名状态混淆。

同一片段重复出现在DMG原clips序列中有权重意义；上表为阅读去重，移植调度必须用原完整序列，不能直接以此表去重后的列表代替。
