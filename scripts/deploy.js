#!/usr/bin/env node
/*
 * @Author: Cphayim
 * @Date: 2019-06-28 09:21:54
 * @LastEditTime: 2019-08-05 15:16:00
 * @Description: 一键部署脚本
 */
import sh from 'shelljs'
import {
  PRIVATE_KEY,
  SERVER_SIDE_RELEASE_DIR,
  RELEASE_DIR,
  SERVER_SIDE_USER,
  SERVER_SIDE_IP,
  YML_FILE,
  SERVER_SIDE_NGINX_CONF_DIR,
  NGINX_CONF
} from './config'
import { Logger } from './log'

/**
 * ?将模板包和配置文件上传到服务器对应目录
 * ?上传 nginx 配置文件，重启 nginx 服务
 */
Logger.info('开始执行部署...')
const { code, stderr } = sh.exec(
  `
    set -e

    ssh ${SERVER_SIDE_USER}@${SERVER_SIDE_IP} -i ${PRIVATE_KEY} "
      set -e
      # 创建对应目录，设置权限
      mkdir -p ${SERVER_SIDE_RELEASE_DIR}
      chmod 755 ${SERVER_SIDE_RELEASE_DIR}
    "

    # 将 release 目录下的文件递归提交到服务端指定目录
    scp -i ${PRIVATE_KEY} ${RELEASE_DIR}/* ${SERVER_SIDE_USER}@${SERVER_SIDE_IP}:${SERVER_SIDE_RELEASE_DIR}
    # 上传 nginx 配置
    scp -i ${PRIVATE_KEY} ${NGINX_CONF} ${SERVER_SIDE_USER}@${SERVER_SIDE_IP}:${SERVER_SIDE_NGINX_CONF_DIR}

    ssh ${SERVER_SIDE_USER}@${SERVER_SIDE_IP} -i ${PRIVATE_KEY} "
      set -e
      # 重载 nginx 服务
      systemctl reload nginx
    "
  `,
  { shell: '/bin/zsh' }
)

if (!code) {
  Logger.success('部署成功')
} else {
  Logger.error(`部署失败: ${stderr}`)
}
