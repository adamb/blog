---
title: "MySQL New Slave Settings"
date: "2016-12-20"
slug: "mysql-new-slave-settings"
---

# MySQL New Slave Settings

I can never remember which fields are important. It's the `master_log_file` and `master_log_pos` but these come from `show slave status`. `Master_log_file` is from `master_log_file` but `master_log_pos` comes from `exec_master_pos`.

```sql
CHANGE MASTER TO master_user = 'dbp3',   
  MASTER_PASSWORD='...',   
  master_log_file="mysql-bin.006818",   
  master_log_pos=234867554;  
  
stop slave;  
mysql> show slave status \G
```

The output shows key details like:
- `Master_Log_File`: mysql-bin.006818
- `Exec_Master_Log_Pos`: 234867554
- `Slave_IO_Running`: No
- `Slave_SQL_Running`: No

Note the important fields for configuring MySQL replication, particularly the log file and position.